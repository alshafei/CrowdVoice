class AddCreatedAddIndexToPosts < ActiveRecord::Migration
  def self.up
    #add_index :posts, :created_at
  end

  def self.down
    #remove_index :posts, :created_at
  end
end
