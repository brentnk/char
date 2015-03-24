# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  # config.vm.box = "puphpet/debian75-x64"
  # config.vm.box = "ubuntu/trusty64"
  config.vm.box = "hashicorp/precise64"

  config.vm.synced_folder "./", "/workspace"
  # config.vm.synced_folder "/elasticsearch/", "/elasticsearch"

  config.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"

  config.vm.network "private_network", type: "dhcp"
  config.vm.network "forwarded_port", guest:5601, host:5602

  # config.vm.provision "docker"
  config.vm.provision "docker" do |d|
    # d.pull_images "sebp/elk"
    d.pull_images "elasticsearch"
    d.run "elasticsearch",
      auto_assign_name: false,
      args: "-p 5601:5601 -v /elasticsearch:/elasticsearch -it --name es"
    # d.run  "sebp/elk",
    #   auto_assign_name: false,
    #   args: "-p 5601:5601 -p 9200:9200 -p 5000:5000 -v /elasticsearch:/elasticsearch -it --name elk"
  end
end
