#include <xc.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "I2C_LCD.h"
#include "Serial.h"

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
volatile unsigned char received;
int relayState;
bit allRelayFlag = 0;
uint16_t rawVoltage[10] = {0};
uint16_t rawCurrent[10] = {0};
unsigned char adconMap[] = {
    0x41, 0x49, 0x51, 0x59, // RA0-RA3
    0x61, 0x69, 0X71, 0X79, // RA4-RA7
};

// Function prototypes
void setup();
int readADC(uint8_t channel);

void main()
{
  setup();

  while (1)
  {
    if (RCIF)
    {
      if (OERR)
      {
        CREN = 0;
        CREN = 1;
      }

      received = RCREG;

      if (received >= 'A' && received <= 'D')
      {
        unsigned char bit_pos = ((received - 64) - 1) + 4;

        if (PORTD & (1 << bit_pos))
          PORTD &= ~(1 << bit_pos);
        else
          PORTD |= (1 << bit_pos);

        relayState = PORTD;
      }
      else if (received == 'E')
      {
        allRelayFlag ^= 1;

        if (allRelayFlag)
          PORTD = 0x00;
        else
          PORTD = 0xF0;

        relayState = PORTD;
      }
      else if (received == 'F')
      {
        char buf[32];

        for (unsigned int i = 0; i < 10; i++)
        {
          rawVoltage[i] = readADC(0);
          rawCurrent[i] = readADC(1);
        }

        UART_Write_Text("data:");
        for (int i = 0; i < 10; i++)
        {
          sprintf(buf, "%u,%u", rawVoltage[i], rawCurrent[i]);
          UART_Write_Text(buf);
          if (i < 9)
            UART_Write_Text(";");
        }
        UART_Write_Text("\n");
      }
      else if (received == 'G')
      {
        char buf[16];
        UART_Write_Text("state:");
        sprintf(buf, "0x%02X\n", relayState);
        UART_Write_Text(buf);
        UART_Write_Text("\n");
      }
    }
  }
}

void setup()
{
  SPBRG = 25;
  SYNC = 0;
  SPEN = 1;
  TX9 = 0;
  BRGH = 1;
  TXEN = 1;
  RX9 = 0;
  CREN = 1;

  ADCON1 = 0x80;

  TRISD = 0x00;
  PORTD = 0xF0;
}

int readADC(uint8_t channel)
{
  if (channel >= 0 && channel <= 7)
    ADCON0 = adconMap[channel];

  __delay_ms(1);
  GO = 1;
  while (GO_DONE == 1)
    ;
  return ((ADRESH << 8) | ADRESL);
}

// EOF
