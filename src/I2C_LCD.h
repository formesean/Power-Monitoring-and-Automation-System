#ifndef I2C_LCD_H
#define I2C_LCD_H

#define _XTAL_FREQ            4000000

// I2C Communication Settings
#define I2C_BAUD_RATE          100000        // Standard I2C Baud rate (100 kHz)
#define SCL_PIN                TRISC3        // SCL pin direction, output
#define SDA_PIN                TRISC4        // SDA pin direction, output

// LCD Command Set (Standard Commands)
#define LCD_CLEAR              0x01          // Clear display
#define LCD_RETURN_HOME        0x02          // Return cursor to home position
#define LCD_ENTRY_MODE_SET     0x04          // Entry mode set
#define LCD_CURSOR_OFF         0x0C          // Turn cursor off
#define LCD_UNDERLINE_ON       0x0E          // Underline cursor on
#define LCD_BLINK_CURSOR_ON    0x0F          // Blink cursor on
#define LCD_SHIFT_LEFT         0x18          // Shift display left
#define LCD_SHIFT_RIGHT        0x1E          // Shift display right

// LCD Backlight Control
#define LCD_BACKLIGHT          0x08          // Enable backlight
#define LCD_NO_BACKLIGHT       0x00          // Disable backlight

// LCD Row and Column Settings (for 2-line display)
#define LCD_FIRST_ROW          0x80          // Address for the first row (0x00 is default)
#define LCD_SECOND_ROW         0xC0          // Address for the second row
#define LCD_THIRD_ROW          0x94          // Address for the third row (for larger displays)
#define LCD_FOURTH_ROW         0xD4          // Address for the fourth row

// LCD Display Types
#define LCD_TYPE_5x7           0             // 5x7 character font
#define LCD_TYPE_5x10          1             // 5x10 character font
#define LCD_TYPE_2_LINES       2             // 2-line display

// Function Prototypes
void LCD_Init(unsigned char I2C_Address);
void LCD_CMD(unsigned char cmd);
void LCD_Write_Char(char data);
void LCD_Write_String(const char *str);
void LCD_Set_Cursor(unsigned char row, unsigned char col);
void LCD_Backlight(void);
void LCD_NoBacklight(void);
void LCD_Shift_Left(void);
void LCD_Shift_Right(void);
void LCD_Clear(void);

static void IO_Expander_Write(unsigned char data);
static void LCD_Write_4Bit(unsigned char nibble);

#endif

// EOF
