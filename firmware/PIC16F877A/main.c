#include <xc.h> // include file for the XC8 compiler
#include <stdio.h>

#include "I2C.h"
#include "I2C_LCD.h"

#pragma config FOSC = XT
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF
#pragma config CPD = OFF
#pragma config WRT = OFF
#pragma config CP = OFF

#define _XTAL_FREQ 4000000

unsigned int display_flag = 0;
unsigned int relay1_on = 0;
unsigned int relay2_on = 0;
unsigned int relay3_on = 0;
unsigned int relayState = 0;

void interrupt ISR()
{
  GIE = 0;
  if (INTF)
  {
    INTF = 0;
  }
  else if (RBIF)
  {
    RBIF = 0;

    if (RB5 == 1)
    {
      while (RB5)
        ;
      display_flag = 1;
    }
    if (RB6 == 1)
    {
      while (RB6)
        ;
      display_flag = 2;
    }
    if (RB7 == 1)
    {
      while (RB7)
        ;
      display_flag = 3;
    }
  }
  GIE = 1;
}

void main(void)
{
  INTE = 1;
  INTF = 0;
  RBIE = 1;
  RBIF = 0;
  GIE = 1;
  PEIE = 1;

  TRISB = 0xFF;
  TRISD = 0x00;
  PORTD = 0x00;

  init_I2C_Master();
  LCD_Init(0x4E); // Initialize LCD module with I2C address = 0x4E

  LCD_Set_Cursor(1, 1);
  LCD_Write_String("Hello");
  LCD_Set_Cursor(2, 1);
  LCD_Write_String("World!");

  while (1)
  {
    if (display_flag == 1)
    {
      LCD_Clear();
      LCD_Set_Cursor(1, 1);
      LCD_Write_String("RB5 Pressed");
      relay1_on ^= 1;

      if (relay1_on)
      {
        relayState |= 0x01;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R1: ON");
      }
      else
      {
        relayState ^= 0x01;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R1: OFF");
      }
    }

    if (display_flag == 2)
    {
      LCD_Clear();
      LCD_Set_Cursor(1, 1);
      LCD_Write_String("RB6 Pressed");
      relay2_on ^= 1;

      if (relay2_on)
      {
        relayState |= 0x02;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R2: ON");
      }
      else
      {
        relayState ^= 0x02;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R2: OFF");
      }
    }

    if (display_flag == 3)
    {
      LCD_Clear();
      LCD_Set_Cursor(1, 1);
      LCD_Write_String("RB7 Pressed");
      relay3_on ^= 1;

      if (relay3_on)
      {
        relayState |= 0x04;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R3: ON");
      }
      else
      {
        relayState ^= 0x04;
        PORTD = relayState;
        LCD_Set_Cursor(2, 1);
        LCD_Write_String("R3: OFF");
      }
    }

    display_flag = 0;
    __delay_ms(50);
  }
}
