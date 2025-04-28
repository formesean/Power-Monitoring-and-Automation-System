#include <xc.h> // Include the necessary header for your microcontroller
#include "i2c.h"

void init_I2C_Master(void)
{
    TRISC3 = 1;     // set RC3 (SCL) to input
    TRISC4 = 1;     // set RC4 (SDA) to input
    SSPCON = 0x28;  // SSP enabled, I2C master mode
    SSPCON2 = 0x00; // start condition idle, stop condition idle
                    // receive idle
    SSPSTAT = 0x00; // slew rate enabled
    SSPADD = 0x09;  // clock frequency at 100 KHz (FOSC = 4MHz)
}

void I2C_Wait(void)
{
    /* wait until all I2C operation are finished */
    while ((SSPCON2 & 0x1F) || (SSPSTAT & 0x04))
        ;
}

void I2C_Start(void)
{
    /* wait until all I2C operation are finished */
    I2C_Wait();
    /* enable start condition */
    SEN = 1; // SSPCON2
}

void I2C_Stop(void)
{
    /* wait until all I2C operation are finished */
    I2C_Wait();
    /* enable stop condition */
    PEN = 1; // SSPCON2
}

void I2C_RepeatedStart(void)
{
    /* wait until all I2C operation are finished */
    I2C_Wait();
    /* enable repeated start */
    RSEN = 1; // SSPCON2
}

void I2C_Send(unsigned char data)
{
    /* wait until all I2C operation are finished */
    I2C_Wait();
    /* write data to buffer and transmit */
    SSPBUF = data;
}

unsigned char I2C_Receive(unsigned char ack)
{
    unsigned char temp;
    I2C_Wait();            // wait until all I2C operation are finished
    RCEN = 1;              // enable receive (SSPCON2 reg)
    I2C_Wait();            // wait until all I2C operation are finished
    temp = SSPBUF;         // read SSP buffer
    I2C_Wait();            // wait until all I2C operation are finished
    ACKDT = (ack) ? 0 : 1; // set acknowledge (ACK) or not acknowledge (NACK)
    ACKEN = 1;             // enable acknowledge sequence
    return temp;
}
