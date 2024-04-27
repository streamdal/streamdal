#!/usr/bin/env python3

import argparse
import json
import os
import random
import string

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_pod_name(length):
    return generate_random_string(length)

def generate_random_json_log():
    log_data = {
        "timestamp": "2024-04-26T12:00:00Z",
        "level": random.choice(["INFO", "WARNING", "ERROR"]),
        "message": generate_random_string(20)
    }
    return json.dumps(log_data)

def write_logs_to_file(file_path, num_lines):
    with open(file_path, 'w') as file:
        for _ in range(num_lines):
            log_line = generate_random_json_log()
            file.write(log_line + '\n')

def main():
    parser = argparse.ArgumentParser(description="Generate random JSON log lines and write them to a file.")
    parser.add_argument("directory", help="Directory to write log files to")
    parser.add_argument("--num-lines", type=int, default=10, help="Number of log lines to generate (default: 10)")
    args = parser.parse_args()

    if not os.path.exists(args.directory):
        os.makedirs(args.directory)

    pod_name = generate_pod_name(8)

    file_name = f"{pod_name}.log"
    file_path = os.path.join(args.directory, file_name)
    num_lines = args.num_lines

    write_logs_to_file(file_path, num_lines)
    print(f"{num_lines} random JSON log lines written to {file_path}")

if __name__ == "__main__":
    main()
