#include <xc.h>
#include <stdio.h>

#include "I2C.h"
#include "I2C_LCD.h"

// Configuration bits
#pragma config FOSC = XT
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF
#pragma config CPD = OFF
#pragma config WRT = OFF
#pragma config CP = OFF

#define _XTAL_FREQ 4000000

// Global variables
unsigned int display_flag = 0;
unsigned char receivedData;
bit receivedData_flag = 0;
unsigned char sendData;
bit sendFlag = 0;
bit allRelayFlag = 0;

// Interrupt Service Routine
void interrupt ISR() {
    
  if (RCIF) {
    if (OERR) {
      CREN = 0; // Clear overrun error
      CREN = 1; // Re-enable receiver
    }
    receivedData_flag = 1;

    receivedData = RCREG;
    switch (receivedData) {
      case '1': display_flag = 1; break;
      case '2': display_flag = 2; break;
      case '3': display_flag = 3; break;
      case '4': display_flag = 4; break;
      case '5': display_flag = 5; break;
    }
  }

    if (INTF) {
      INTF = 0;       // Clear external interrupt flag
      sendFlag = 1;   // Set flag to send data
    }
}

// Initialize UART, Interrupts, and GPIO 
void initRegisters() {
  // UART Setup for 9600bps @ 4MHz
  SPBRG = 25;       // For 9600 baud rate (4MHz, BRGH=1)
  SYNC = 0;         // Asynchronous mode
  SPEN = 1;         // Enable serial port (TX/ RX)
  TX9 = 0;          
  BRGH = 1;         // High-speed baud rate
  TXEN = 1;         // Enable transmitter
  RX9 = 0;          
  CREN = 1;         // Enable continuous receive

  // Interrupts
  RCIE = 1;         // Enable UART receive interrupt
  INTE = 1;         // Enable external interrupt (RB0)
  PEIE = 1;         // Enable peripheral interrupts
  GIE = 1;          // Enable global interrupts

  // GPIO Setup
  TRISB = 0xFF;     // PORTB as input (RB0 for interrupt)
  TRISD = 0x00;     // PORTD as output (relay control)
  PORTD = 0x00;     // Clear PORTD
}

// LCD Initialization
void init_LCD(void) {
  init_I2C_Master();     // I2C master init
  LCD_Init(0x4E);        // LCD init with address 0x4E
  LCD_Set_Cursor(1, 1);
  LCD_Write_String("Hello");
  LCD_Set_Cursor(2, 1);
  LCD_Write_String("World!");
}

// Update LCD Line
void update_LCD(unsigned char line, const char *message) {
  LCD_Set_Cursor(line, 1);
  LCD_Write_String("                "); // Clear line
  LCD_Set_Cursor(line, 1);
  LCD_Write_String(message);
}

// Send data via UART
void sendDataUART(unsigned char chData) {
  while (!TXIF);  // Wait for TX buffer to be empty
  TXREG = chData;
}

// Toggle relay using bitmask (RD0–RD3) 
void toggleRelay(unsigned char relayNum) {
  if (relayNum < 1 || relayNum > 4) return;

  unsigned char bit_pos = relayNum - 1;

  PORTD ^= (1 << bit_pos);  

  if (PORTD & (1 << bit_pos)) {
    update_LCD(2, "Relay ON ");
  } 
  else {
    update_LCD(2, "Relay OFF");
  }
}

void setAllRelays(unsigned char state) {
  unsigned char bitmask = 0x0F; // Bitmask for RD0–RD3 (00001111)

  allRelayFlag ^= 0;
  
  if (allRelayFlag) {
    // Turn all relays ON (Set RD0–RD3 to 1)
    PORTD |= bitmask;   // Set bits RD0–RD3
    update_LCD(2, "All ON ");
    } 

    else {
    // Turn all relays OFF (Clear RD0–RD3)
    PORTD &= ~bitmask;  // Clear bits RD0–RD3
    update_LCD(2, "All OFF");
    }
}


void main() {
  initRegisters();
  init_LCD();

  while (1) {
    if (receivedData_flag) {
      toggleRelay(display_flag);

      if (display_flag == 5)
      {
        setAllRelays(display_flag);
      }
      
      display_flag = 0;
      receivedData_flag = 0;
    }

    if (sendFlag) {
      sendDataUART('1');
      sendFlag = 0;
    }

    // __delay_ms(50);
    }
}