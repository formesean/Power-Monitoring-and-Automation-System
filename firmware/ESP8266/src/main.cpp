#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char *ssid = "sean-dako";
const char *pass = "qweasdzxc";

WiFiClient wifiClient;
HTTPClient httpClient;

unsigned long myTalkBackID = 54567;
const char *myTalkBackKey = "OG6KNK3ER91ZD3UE";

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

void setup()
{
  Serial.begin(9600);
  connectWiFi();
}

void loop()
{
  String url = "http://api.thingspeak.com/talkbacks/" + String(myTalkBackID) + "/commands/execute";
  String postData = "api_key=" + String(myTalkBackKey) + "&headers=false";

  httpClient.begin(wifiClient, url);
  httpClient.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int httpCode = httpClient.POST(postData);

  if (httpCode > 0)
  {
    Serial.printf("HTTP Status: %d\n", httpCode);

    if (httpCode == HTTP_CODE_OK)
    {
      String payload = httpClient.getString();
      payload.trim();
      Serial.println("Raw Response: " + payload);

      if (payload.length() > 0)
      {
        String command = payload;

        Serial.print("Command: ");
        Serial.println(command);

        if (command == "Outlet_1_ON" || command == "Outlet_1_OFF")
        {
          Serial.println('1');
          Serial.write('1');
        }
        else if (command == "Outlet_2_ON" || command == "Outlet_2_OFF")
        {
          Serial.println('2');
          Serial.write('2');
        }
        else if (command == "Outlet_3_ON" || command == "Outlet_3_OFF")
        {
          Serial.println('3');
          Serial.write('3');
        }
        else if (command == "Outlet_4_ON" || command == "Outlet_4_OFF")
        {
          Serial.println('4');
          Serial.write('4');
        }
        else if (command == "ALL_ON" || command == "ALL_OFF")
        {
          Serial.println('5');
          Serial.write('5');
        }
        else
        {
          Serial.println("Unknown command.");
        }
      }
    }
  }
  else
  {
    Serial.print("HTTP Request failed, error: ");
    Serial.println(httpClient.errorToString(httpCode));
  }

  httpClient.end();

  delay(500);
}

// EOF
