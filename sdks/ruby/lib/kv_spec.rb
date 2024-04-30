require 'rspec'
require_relative 'kv'

RSpec.describe 'KeyValue' do
  before(:each) do
    @kv = Streamdal::KeyValue.new
  end

  it 'stores and retrieves key-value pair' do
    @kv.set('key', 'value')
    expect(@kv.get('key')).to eq('value')
  end

  it 'deletes a key' do
    expect(@kv.keys.length).to eq(0)
    @kv.set('key1', 'value')
    @kv.set('key2', 'value')
    expect(@kv.keys.length).to eq(2)
    @kv.delete('key1')
    expect(@kv.keys.length).to eq(1)
  end

  it 'returns array of keys' do
    expect(@kv.keys.length).to eq(0)
    @kv.set('key1', 'value')
    expect(@kv.keys.length).to eq(1)
    expect(@kv.keys[0]).to eq('key1')
  end

  it 'returns array of item values' do
    expect(@kv.keys.length).to eq(0)
    @kv.set('key1', 'value1')
    expect(@kv.keys.length).to eq(1)
    expect(@kv.items[0]).to eq('value1')
  end

  it 'returns if a key exists or not' do
    expect(@kv.exists('key1')).to eq(false)
    @kv.set('key1', 'value')
    expect(@kv.exists('key1')).to eq(true)
  end

  it 'purges all keys' do
    expect(@kv.keys.length).to eq(0)
    @kv.set('key1', 'value')
    @kv.set('key2', 'value')
    expect(@kv.keys.length).to eq(2)
    num_keys = @kv.purge
    expect(@kv.keys.length).to eq(0)
    expect(num_keys).to eq(2)
  end

end