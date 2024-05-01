import json
import time
import string
import random
import socket

# Logstash agent host and port
logstash_host = "localhost"  # Replace with the actual host of Logstash agent
logstash_port = 5044

def generate_random_email(domain_list, length=7):
    """Generates a random email address."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length)) + '@' + random.choice(domain_list)

def generate_random_phone():
    """Generates a random phone number."""
    return f"+1-{random.randint(200, 999)}-{random.randint(200,999)}-{random.randint(1000,9999)}"

def generate_log():
    """Generates a simulated JSON log entry."""
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "user_id": random.randint(1, 100),
        "activity": random.choice(["login", "logout", "purchase", "view"]),
        "details": {
            "ip_address": f"192.168.1.{random.randint(1, 255)}",
            "location": random.choice(["USA", "Canada", "UK", "Germany", "France"]),
            "email": generate_random_email(["example.com", "sample.org", "test.net"]),
            "phone": generate_random_phone(),
            # Fields for demonstration purposes
            "long_field": ''.join(random.choices(string.ascii_letters + string.digits, k=1024)),
            "product_color": random.choice(["red", "blue", "green", "yellow", "black"]),
            "product_size": random.choice(["small", "medium", "large", "extra large"]),
            "irrelevant_field": "This field is not relevant to the app"
        },
        "is_e2e_test_account": random.choice([True] * 2 + [False] * 8)  # 20% chance of being True
    }
    return json.dumps(log_entry)

def main():
    while True:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.connect((logstash_host, logstash_port))
                while True:
                    log = generate_log()
                    print(log)
                    sock.sendall((log + "\n").encode("utf-8"))
                    time.sleep(1)  # Log every 1 second. Adjust as needed.
        except BrokenPipeError:
            print("Connection lost. Attempting to reconnect...")
            time.sleep(5)  # Wait for 5 seconds before reconnecting
        except Exception as e:
            print(f"An error occurred: {e}")
            break

if __name__ == "__main__":
    main()
