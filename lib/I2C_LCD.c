#include <xc.h>

#include "I2C_LCD.h"
#include "I2C.h"

// LCD State Variables
static unsigned char RS = 0;                          // Register Select (RS) flag for command/data
static unsigned char i2c_address;                     // I2C Address for LCD
static unsigned char backlight_state = LCD_BACKLIGHT; // Backlight state

// Private Function Prototypes
static void LCD_Write_4Bit(unsigned char nibble);
static void IO_Expander_Write(unsigned char data);

// Initializes the LCD
void LCD_Init(unsigned char I2C_Address)
{
  i2c_address = I2C_Address; // Set I2C address
  IO_Expander_Write(0x00);   // Initial configuration
  __delay_ms(30);            // Wait for the LCD to power up

  // Initializing LCD in 4-bit mode
  LCD_CMD(0x03);
  __delay_ms(5);
  LCD_CMD(0x03);
  __delay_ms(5);
  LCD_CMD(0x03);
  __delay_ms(5);

  // Setting LCD to its home position and configuration
  LCD_CMD(LCD_RETURN_HOME);
  __delay_ms(5);
  LCD_CMD(0x20 | (LCD_TYPE_2_LINES << 2)); // Set LCD type (2-line, 5x7/5x10 font)
  __delay_ms(50);
  LCD_CMD(LCD_CURSOR_OFF); // Turn on the display
  __delay_ms(50);
  LCD_CMD(LCD_CLEAR); // Clear display
  __delay_ms(50);
  LCD_CMD(LCD_ENTRY_MODE_SET | LCD_RETURN_HOME); // Set entry mode
  __delay_ms(50);
}

// Writes data to the I2C expander (interface to LCD)
static void IO_Expander_Write(unsigned char data)
{
  I2C_Start();                      // Start I2C communication
  I2C_Send(i2c_address);            // Send I2C address
  I2C_Send(data | backlight_state); // Send data with backlight control
  I2C_Stop();                       // Stop I2C communication
}

// Writes a 4-bit command/data to the LCD
static void LCD_Write_4Bit(unsigned char nibble)
{
  nibble |= RS;                     // Set or clear RS based on command/data
  IO_Expander_Write(nibble | 0x04); // Send high nibble with E signal
  IO_Expander_Write(nibble & 0xFB); // Clear E signal
  __delay_us(50);                   // Small delay for stability
}

// Sends a command to the LCD
void LCD_CMD(unsigned char cmd)
{
  RS = 0;                            // Set RS to 0 for command
  LCD_Write_4Bit(cmd & 0xF0);        // Send high nibble
  LCD_Write_4Bit((cmd << 4) & 0xF0); // Send low nibble
}

// Writes a character to the LCD
void LCD_Write_Char(char data)
{
  RS = 1;                             // Set RS to 1 for data
  LCD_Write_4Bit(data & 0xF0);        // Send high nibble
  LCD_Write_4Bit((data << 4) & 0xF0); // Send low nibble
}

// Writes a string to the LCD
void LCD_Write_String(const char *str)
{
  for (int i = 0; str[i] != '\0'; i++) // Loop through the string
    LCD_Write_Char(str[i]);            // Write each character
}

// Sets the cursor to a specific row and column
void LCD_Set_Cursor(unsigned char row, unsigned char col)
{
  unsigned char address = 0x80; // Default base address for the first row

  switch (row) // Determine the row address
  {
  case 2:
    address = LCD_SECOND_ROW;
    break;
  case 3:
    address = LCD_THIRD_ROW;
    break;
  case 4:
    address = LCD_FOURTH_ROW;
    break;
  default:
    address = LCD_FIRST_ROW;
    break;
  }

  LCD_CMD(address + col - 1); // Adjust column position and send the command
}

// Turns on the LCD backlight
void LCD_Backlight(void)
{
  backlight_state = LCD_BACKLIGHT; // Set backlight state to on
  IO_Expander_Write(0);            // Update I2C expander with the backlight state
}

// Turns off the LCD backlight
void LCD_NoBacklight(void)
{
  backlight_state = LCD_NO_BACKLIGHT; // Set backlight state to off
  IO_Expander_Write(0);               // Update I2C expander with the backlight state
}

// Shifts the display to the left
void LCD_Shift_Left(void)
{
  LCD_CMD(0x18);  // Command to shift display left
  __delay_us(40); // Small delay for stability
}

// Shifts the display to the right
void LCD_Shift_Right(void)
{
  LCD_CMD(0x1C);  // Command to shift display right
  __delay_us(40); // Small delay for stability
}

// Clears the LCD screen
void LCD_Clear(void)
{
  LCD_CMD(0x01);  // Clear screen command
  __delay_us(40); // Small delay for stability
}

// EOF
