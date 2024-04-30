require 'rspec'
require 'sp_command_pb'
require 'sp_kv_pb'
require_relative 'spec_helper'
require_relative 'validation'

module Streamdal
  class TestClient
    include Validation
  end
end

RSpec.describe "Validation" do
  let(:validation) { Streamdal::TestClient.new }

  context "#validate_kv_command" do
    it "raises an error if cmd is nil" do
      expect { validation.validate_kv_command(nil) }.to raise_error("cmd is required")
    end

    it "raises an error if cmd.kv is nil" do
      cmd = Streamdal::Protos::Command.new
      expect { validation.validate_kv_command(cmd) }.to raise_error("kv command is required")
    end

    it "raises an error if cmd.kv.instructions is nil" do
      cmd = Streamdal::Protos::Command.new(kv: Streamdal::Protos::KVCommand.new)
      expect { validation.validate_kv_command(cmd) }.to raise_error("instructions are required")
    end

    it "raises an error if cmd.kv.instructions is empty" do
      cmd = Streamdal::Protos::Command.new(kv: Streamdal::Protos::KVCommand.new(instructions: []))
      expect { validation.validate_kv_command(cmd) }.to raise_error("instructions are required")
    end

    it "validates each instruction" do
      cmd = Streamdal::Protos::Command.new(kv: Streamdal::Protos::KVCommand.new(instructions: [Streamdal::Protos::KVInstruction.new]))
      expect(validation).to receive(:validate_kv_instruction).with(any_args).once
      validation.validate_kv_command(cmd)
    end
  end

  context "#validate_kv_instruction" do
    it "raises an error if inst is nil" do
      expect { validation.validate_kv_instruction(nil) }.to raise_error("instruction is required")
    end

    it "raises an error if inst.id is empty" do
      inst = Streamdal::Protos::KVInstruction.new
      expect { validation.validate_kv_instruction(inst) }.to raise_error("instruction id is required")
    end

    it "raises an error if inst.action is KV_ACTION_UNSET" do
      inst = Streamdal::Protos::KVInstruction.new(id: "id", action: 0)
      expect { validation.validate_kv_instruction(inst) }.to raise_error("instruction action is required")
    end

    it "raises an error if inst.object is nil" do
      inst = Streamdal::Protos::KVInstruction.new(id: "id", action: 1)
      expect { validation.validate_kv_instruction(inst) }.to raise_error("instruction object is required")
    end
  end

  context '#validate_kv_object' do
    it "raises an error if obj is nil" do
      expect { validation.validate_kv_object(nil) }.to raise_error("object is required")
    end

    it "raises an error if obj.key is empty" do
      obj = Streamdal::Protos::KVObject.new
      expect { validation.validate_kv_object(obj) }.to raise_error("kv object key is required")
    end

    it "raises an error if obj.value is empty" do
      obj = Streamdal::Protos::KVObject.new(key: "key")
      expect { validation.validate_kv_object(obj) }.to raise_error("kv object value is required")
    end
  end

  context "#validate_tail_request" do
    it "raises an error if cmd is nil" do
      expect { validation.validate_tail_request(nil) }.to raise_error("cmd is required")
    end

    it "raises an error if cmd.tail_request is nil" do
      cmd = Streamdal::Protos::Command.new
      cmd.audience = Streamdal::Protos::Audience.new
      cmd.tail = nil
      expect { validation.validate_tail_request(cmd) }.to raise_error("tail is required")
    end
  end

end