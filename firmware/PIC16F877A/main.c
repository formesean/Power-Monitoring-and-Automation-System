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

volatile unsigned char display_flag = 0;
unsigned char receivedData;
unsigned char relay1_on = 0;

void interrupt ISR()
{
    
    GIE = 0;

    // UART 
    if (RCIF) {  
        if (OERR) {  
            CREN = 0;
            CREN = 1;
        }
        
        receivedData = RCREG; 

        
        if (receivedData == '1') {
            display_flag = 1; 
        }

        RCIF = 0;  
    }

    if (INTF) {
        INTF = 0;  
    }

   
    GIE = 1;
}

void main(void)
{
    // UART Configuration
    SPBRG = 0x19;       
    SYNC = 0;           
    SPEN = 1;           
    
    // Transmitter configuration
    TX9 = 0;            
    BRGH = 1;          
    TXEN = 1;           
    
    // Receiver configuration
    CREN = 1;           
    RX9 = 0;            
    
    // Interrupt Configuration
    RCIE = 1;           
    INTE = 1;          
    PEIE = 1;           
    GIE = 1;            

    // GPIO Configuration
    TRISB = 0xFF;       
    TRISD = 0x00;       
    PORTD = 0x00;       

    
    // init_I2C_Master();  
    // LCD_Init(0x4E);     
    // LCD_Set_Cursor(1, 1);
    // LCD_Write_String("Hello");
    // LCD_Set_Cursor(2, 1);
    // LCD_Write_String("World!");

    
    while (1)
    {
        if (display_flag == 1)  
        {
            
            relay1_on ^= 1;  

            if (relay1_on) {
                RD1 = 1; 
            	// LCD_Set_Cursor(2, 1);
    			// LCD_Write_String("ON"); 
            } else {
                RD1 = 0;  
                // LCD_Set_Cursor(2, 1);
    			// LCD_Write_String("OFF"); 
            }

            display_flag = 0;  
        }

       
    }
}
