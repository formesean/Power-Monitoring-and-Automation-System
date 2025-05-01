# IoT-Integrated Power Monitoring and Automation System

A project that aims to provide a smarter, more efficient energy management system through the use of IoT, enabling remote control and real-time monitoring of electrical outlets.

## 🔧 Project Overview

The **IoT-Integrated Power Monitoring and Automation System** is designed to address the rising energy costs and inefficiencies in manual power usage. The system integrates:

- **PIC16F877A microcontroller** for control logic
- **ESP8266 microcontroller** for Wi-Fi-based remote communication
- **Voltage (ZMPT101B) and current (ACS712) sensors** for monitoring power usage
- **Relay modules** for switching appliances on/off
- **Web-based interface** for remote interaction via the ThingSpeak TalkBack API

## 📦 Features

- 🕹️ **Web-Based Remote Switching** – Turn outlets ON/OFF via a Wi-Fi-enabled web interface.
- 📊 **Real-Time Monitoring** – View live voltage, current, and estimated power usage using ZMPT101B and ACS712 sensors.
- 📅 **Scheduled On/Off Automation** – Supports timed switching using ThingSpeak TalkBack commands.
- 📺 **Local LCD Display** – Displays outlet states in real time via an I2C LCD.
- 🌐 **ThingSpeak Integration** – Stores and visualizes consumption data on the cloud.

> ⚠️ **Limitations:**
> - Controls up to **4 AC outlets only**.
> - Power monitoring is **aggregate**, not per individual outlet.
> - Advanced features like per-outlet energy analytics or AI-based automation are not included.
> - Relies on an active Wi-Fi connection and ThingSpeak cloud API for remote control.

## 📐 System Architecture

The system architecture includes:

- **User Interface:** A web app that sends control commands and visualizes data.
- **PIC16F877A:** Processes commands, controls relays, reads sensor data.
- **ESP8266:** Bridges Wi-Fi and forwards commands to the PIC via UART.
- **LCD Display:** Shows real-time status of all outlets.
- **ThingSpeak:** Receives and stores sensor data, enabling visualization.

## 📚 Tech Stack

- `C` (for PIC microcontroller logic)
- `C++` (for ESP8266 firmware)
- `ThingSpeak` (IoT analytics and command API)
- `UART/I2C` (microcontroller communication)
- `TCP/IP` (Wi-Fi communication)

## ⚙️ Hardware Used

- PIC16F877A
- ESP8266 (NodeMCU/ESP-01S)
- ZMPT101B Voltage Sensor
- ACS712 Current Sensor
- 4-channel or 4x 1-channel relay module/s
- 16x2 LCD (I2C)
- AC outlets & power source

## 👥 Team Members

- **Sean Karl Tyrese G. Aguilar** - Team Lead / System Architect & Developer
- **Piolo Pascual E. Besinga** - Firmware & UI Developer
- **Bea Belle Therese B. Caños** - Firmware & Hardware Developer
- **Von Juztis A. Elciario** - Hardware Developer

---

> Designed and built with 💡 by USC Computer Engineering students as a final requirement for CPE 3201.

