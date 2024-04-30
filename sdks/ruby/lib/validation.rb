##
# Validation mix-in module

module Validation
  def validate_set_pipelines(cmd)
    if cmd.nil?
      raise "cmd is required"
    end

    if cmd.audience.nil?
      raise "audience is required"
    end

    if cmd.set_pipelines.nil?
      raise "set_pipelines command is required"
    end

    cmd.set_pipelines.each do |pipeline|
      if pipeline.id == ""
        raise "pipeline id is required"
      end
    end
  end

  def validate_kv_command(cmd)
    if cmd.nil?
      raise "cmd is required"
    end

    if cmd.kv.nil?
      raise "kv command is required"
    end

    if cmd.kv.instructions.nil? || cmd.kv.instructions.length == 0
      raise "instructions are required"
    end

    cmd.kv.instructions.each do |inst|
      validate_kv_instruction(inst)
    end
  end

  def validate_kv_instruction(inst)
    if inst.nil?
      raise "instruction is required"
    end

    if inst.id == ""
      raise "instruction id is required"
    end

    if inst.action.nil?
      raise "instruction action is required"
    end

    if inst.action == :KV_ACTION_UNSET
      raise "instruction action is required"
    end

    if inst.object.nil?
      raise "instruction object is required"
    end

    validate_kv_object(inst.object)
  end

  def validate_kv_object(obj)
    if obj.nil?
      raise "object is required"
    end

    if obj.key == ""
      raise "kv object key is required"
    end

    if obj.value == ""
      raise "kv object value is required"
    end

  end

  def validate_tail_request(cmd)
    if cmd.nil?
      raise "cmd is required"
    end

    if cmd.audience.nil?
      raise "audience is required"
    end

    if cmd.tail.nil?
      raise "tail is required"
    end
  end
end