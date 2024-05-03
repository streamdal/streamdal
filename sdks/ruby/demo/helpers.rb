require 'json'
require 'colorize'

def status_to_string(status)
  case status
  when :EXEC_STATUS_TRUE
    "TRUE".green
  when :EXEC_STATUS_FALSE
    "FALSE"
  when :EXEC_STATUS_ERROR
    "ERROR".red
  else
    "Unknown"
  end
end

def jsonpp(json_string)
  out = colorize_json(json_string, "")
  out[0..-3]
end

def colorize_json(json_string, indent = "")
  json_hash = JSON.parse(json_string)
  colored_json = indent + "{\n"
  indent += "  "
  json_hash.each do |key, value|
    if value.is_a?(Hash)
      colored_json += colorize_json(value.to_json, indent)
      next
    end
    colored_json << "#{indent}#{key.to_s.colorize(:color => :light_blue)}: "
    colored_json << "#{value.to_s.colorize(:color => :light_green)},\n"
  end
  # Remove trailing comma
  colored_json = colored_json[0..-3] + "\n"

  # Remove indent
  indent = indent[2..-1]
  colored_json + "#{indent}},\n"
end

def metadata_to_string(metadata)
  metadata.map { |k, v| "#{k}: #{v}" }.join(", ")
end

class String
  def bold;           "\e[1m#{self}\e[22m" end
  def italic;         "\e[3m#{self}\e[23m" end
  def underline;      "\e[4m#{self}\e[24m" end
  def green;          "\e[32m#{self}\e[0m" end
  def red;            "\e[31m#{self}\e[0m" end
end