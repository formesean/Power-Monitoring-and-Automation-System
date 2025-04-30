#include <xc.h> // include file for the XC8 compiler
#include <stdio.h>

#include "./lib/I2C.h"
#include "./lib/I2C_LCD.h"

#pragma config FOSC = XT
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF
#pragma config CPD = OFF
#pragma config WRT = OFF
#pragma config CP = OFF

#define _XTAL_FREQ 4000000

void main(void)
{
  init_I2C_Master();
  LCD_Init(0x4E); // Initialize LCD module with I2C address = 0x4E

  LCD_Set_Cursor(1, 1);
  LCD_Write_String("Hello");
  LCD_Set_Cursor(2, 1);
  LCD_Write_String("World!");

  while (1)
  {
  }
}
