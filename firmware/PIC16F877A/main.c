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
#define CMD_BUFFER_SIZE 10

// Global variables
volatile unsigned char relayNum;
uint8_t counter = 0;
int voltageZero = 512;
int currentZero = 512;
bit allRelayFlag = 0;
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
    unsigned int rawVoltage = readADC(0);
    unsigned int rawCurrent = readADC(1);
    char rxBuffer[6];

    // __delay_ms(1);
    // counter++;
    // if (counter >= 5000)
    // {
      UART_Write_Text("DATA:");
      UART_Write_Number(rawVoltage);
      UART_Write_Text(",");
      UART_Write_Number(rawCurrent);
      UART_Write_Text("\n");
    //   counter = 0;
    // }

    if (RCIF)
    {
      if (OERR)
      {
        CREN = 0;
        CREN = 1;
      }

      relayNum = RCREG - '0';

      if (relayNum >= 1 && relayNum <= 4)
      {
        unsigned char bit_pos = relayNum - 1;
        PORTD ^= (1 << bit_pos);
      }

      if (relayNum == 5)
      {
        allRelayFlag ^= 1;

        if (allRelayFlag)
          PORTD = 0x0F;
        else
          PORTD = 0x00;
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
  PORTD = 0x00;
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
