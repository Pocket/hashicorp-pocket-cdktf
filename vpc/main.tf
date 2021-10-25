terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = ">= 3.63"
    }
  }
  required_version = ">= 1.0.9"
}
provider "aws" {
  region = "us-west-2"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "test-vpc"
  cidr = "10.0.0.0/16"

  azs = [
    "us-west-2a",
    "us-west-2b",
    "us-west-2c"
  ]
  private_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"
  ]
  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24"
  ]

  enable_nat_gateway = true
  single_nat_gateway = true
}
