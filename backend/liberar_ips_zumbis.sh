#!/bin/bash

echo "🧹 Iniciando limpeza de Elastic IPs e ENIs órfãs..."

# Lista todas as regiões disponíveis
regions=$(aws ec2 describe-regions --query "Regions[].RegionName" --output text)

for region in $regions; do
  echo "🔍 Verificando região: $region"

  # === 1. Deletar Elastic IPs não associados ===
  eips=$(aws ec2 describe-addresses --region $region \
    --query "Addresses[?AssociationId==null].AllocationId" \
    --output text)

  for eip in $eips; do
    echo "❌ Liberando Elastic IP: $eip"
    aws ec2 release-address --region $region --allocation-id $eip
  done

  # === 2. Deletar ENIs não associadas ===
  enis=$(aws ec2 describe-network-interfaces --region $region \
    --query "NetworkInterfaces[?Status=='available'].NetworkInterfaceId" \
    --output text)

  for eni in $enis; do
    echo "🧼 Deletando ENI: $eni"
    aws ec2 delete-network-interface --region $region --network-interface-id $eni
  done

done

echo "✅ Limpeza finalizada com sucesso!"
