#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

WiFiClient wifiClient;
HTTPClient httpClient;

// Global variables
bool calibrationDone = 0;
int voltage = 0;
int current = 0;
float power = 0;
int voltageZero = 0;
int currentZero = 0;
uint16_t voltageSamples[10];
uint16_t currentSamples[10];
int sampleCount = 0;
unsigned long lastTalkBackCheck = 0;
const unsigned long talkBackInterval = 2500;
String uartBuffer = "";
String relayState = "0xF0";
String lastCommandSent = "";
String commandString = "";
const char *ssid = "sean-dako";
const char *pass = "qweasdzxc";
unsigned long myTalkBackID = 54567;
const char *myTalkBackKey = "OG6KNK3ER91ZD3UE";
String baseURL = "http://api.thingspeak.com/talkbacks/" + String(myTalkBackID) + "/commands";
String executeURL = baseURL + "/execute";
String fullListURL = baseURL + ".json?api_key=" + String(myTalkBackKey);

// Function prototypes
void talkbackPOST(String choice);
int calibrate(const uint16_t *samples, size_t count);
float getVoltageAC(const uint16_t *samples, size_t count, uint16_t frequency);
float getCurrentAC(const uint16_t *samples, size_t count, uint16_t frequency);
void connectWiFi();

void setup()
{
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  connectWiFi();
}

void loop()
{
  while (Serial.available())
  {
    char c = Serial.read();
    uartBuffer += c;

    if (c == '\n')
    {
      uartBuffer.trim();

      if (uartBuffer.startsWith("data:"))
      {
        String data = uartBuffer.substring(5);
        int sampleIdx = 0;
        size_t start = 0;
        while (sampleIdx < 10 && start < data.length())
        {
          int sep = data.indexOf(';', start);
          String pair = (sep == -1) ? data.substring(start) : data.substring(start, sep);
          int comma = pair.indexOf(',');
          if (comma != -1)
          {
            voltageSamples[sampleIdx] = pair.substring(0, comma).toInt();
            currentSamples[sampleIdx] = pair.substring(comma + 1).toInt();
            sampleIdx++;
          }
          if (sep == -1)
            break;
          start = sep + 1;
        }
        sampleCount = sampleIdx;
      }

      if (uartBuffer.startsWith("state:"))
      {
        relayState = uartBuffer.substring(6);
        talkbackPOST("relayState");
      }

      uartBuffer = "";
    }
  }

  if (sampleCount == 10 && !calibrationDone)
  {
    voltageZero = calibrate(voltageSamples, 10);
    currentZero = calibrate(currentSamples, 10);
    calibrationDone = 1;
    sampleCount = 0;
  }

  if (sampleCount == 10 && calibrationDone)
  {
    float voltage = getVoltageAC(voltageSamples, 10, 60);
    float current = getCurrentAC(currentSamples, 10, 60);

    if (voltage <= 100)
    {
      voltage = 0.0;
      current = 0.0;
    }
    else
    {
      voltage = 220.0;
    }

    if (relayState == "0xF0")
    {
      current = 0.0;
    }

    power = voltage * current;
    sampleCount = 0;
  }

  if (millis() - lastTalkBackCheck > talkBackInterval)
  {
    talkbackPOST("power");
    Serial.write('F');
    lastTalkBackCheck = millis();

    httpClient.begin(wifiClient, fullListURL);
    int httpCode = httpClient.GET();

    if (httpCode > 0 && httpCode == HTTP_CODE_OK)
    {
      String payload = httpClient.getString();

      DynamicJsonDocument doc(2048);
      DeserializationError error = deserializeJson(doc, payload);
      int docSize = doc.size();

      if (!error && doc.size() > 0)
      {
        for (int i = 0; i < docSize; i++)
        {
          String command = doc[i]["command_string"].as<String>();
          int commandId = doc[i]["id"].as<int>();
          command.trim();
          bool isOutletCmd = false;

          if (command == "Outlet_1_ON" || command == "Outlet_1_OFF")
          {
            Serial.write('A');
            isOutletCmd = true;
          }
          else if (command == "Outlet_2_ON" || command == "Outlet_2_OFF")
          {
            Serial.write('B');
            isOutletCmd = true;
          }
          else if (command == "Outlet_3_ON" || command == "Outlet_3_OFF")
          {
            Serial.write('C');
            isOutletCmd = true;
          }
          else if (command == "Outlet_4_ON" || command == "Outlet_4_OFF")
          {
            Serial.write('D');
            isOutletCmd = true;
          }
          else if (command == "ALL_ON" || command == "ALL_OFF")
          {
            Serial.write('E');
            isOutletCmd = true;
          }
          else if (command == "getState")
          {
            Serial.write('G');
          }

          httpClient.end();

          if (isOutletCmd || command == "getState")
          {
            String deleteURL = baseURL + "/" + String(commandId) + ".json?api_key=" + String(myTalkBackKey);
            httpClient.begin(wifiClient, deleteURL);
            int deleteCode = httpClient.DELETE();

            if (deleteCode != HTTP_CODE_OK)
              Serial.println(httpClient.errorToString(deleteCode));
          }
        }
      }
    }
    else
    {
      Serial.println(httpClient.errorToString(httpCode));
    }

    httpClient.end();
  }
}

void talkbackPOST(String choice)
{
  if (choice == "power")
    commandString = "POWER:" + String(power);

  if (choice == "relayState")
    commandString = "RELAY_STATE:" + String(relayState);

  if (commandString == lastCommandSent)
    return;

  String postData = "api_key=" + String(myTalkBackKey) + "&command_string=" + commandString;

  httpClient.begin(wifiClient, baseURL);
  httpClient.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int httpCode = httpClient.POST(postData);

  if (httpCode > 0)
  {
    if (httpCode == HTTP_CODE_OK)
    {
      lastCommandSent = commandString;
      relayState = "";
      power = 0;
    }
  }

  httpClient.end();
}

int calibrate(const uint16_t *samples, size_t count)
{
  uint32_t acc = 0;

  for (size_t i = 0; i < count; i++)
  {
    acc += samples[i];
  }

  return acc / count;
}

float getVoltageAC(const uint16_t *samples, size_t count, uint16_t frequency)
{
  uint32_t period = 1000000 / frequency;
  uint32_t t_start = micros();

  uint32_t Vsum = 0;
  uint32_t measurements_count = 0;
  int32_t Vnow;
  size_t i = 0;

  while ((micros() - t_start < period) && (i < count))
  {
    Vnow = samples[i] - voltageZero;
    Vsum += Vnow * Vnow;
    measurements_count++;
    i++;
  }
  float Vrms = sqrt((float)Vsum / measurements_count) / 1023.0 * 5.0 / 0.01;

  return Vrms;
}

float getCurrentAC(const uint16_t *samples, size_t count, uint16_t frequency)
{
  uint32_t period = 1000000 / frequency;
  uint32_t t_start = micros();

  uint32_t Isum = 0;
  uint32_t measurements_count = 0;
  int32_t Inow;
  size_t i = 0;

  while ((micros() - t_start < period) && (i < count))
  {
    Inow = samples[i] - currentZero;
    Isum += Inow * Inow;
    measurements_count++;
    i++;
  }
  float Irms = sqrt((float)Isum / measurements_count) / 1023.0 * 5.0 / 0.1;

  return Irms / 10;
}

void connectWiFi()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);

    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED)
    {
      Serial.print(".");
      delay(1000);
    }
    Serial.println("\nWiFi Connected.");
  }
}

// EOF
