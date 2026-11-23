param([string]$StackName = 'yurim-portfolio', [string]$Region = 'ap-northeast-2')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { throw 'AWS CLI v2 설치와 aws login 또는 SSO 인증이 필요합니다.' }
function Invoke-Aws {
  param([string[]]$Arguments)
  $result = & aws @Arguments
  if ($LASTEXITCODE -ne 0) { throw "AWS 명령 실패: $($Arguments[0]) $($Arguments[1])" }
  return $result
}
Invoke-Aws -Arguments @('sts','get-caller-identity','--query','Account','--output','text')
Invoke-Aws -Arguments @('cloudformation','validate-template','--template-body','file://infra/hosting.yaml','--region',$Region) | Out-Null
Invoke-Aws -Arguments @('cloudformation','deploy','--template-file','infra/hosting.yaml','--stack-name',$StackName,'--region',$Region,'--no-fail-on-empty-changeset')
$raw = Invoke-Aws -Arguments @('cloudformation','describe-stacks','--stack-name',$StackName,'--region',$Region,'--query','Stacks[0].Outputs','--output','json')
$outputs = ($raw -join "`n") | ConvertFrom-Json
$bucket = ($outputs | Where-Object OutputKey -eq 'BucketName').OutputValue
$distribution = ($outputs | Where-Object OutputKey -eq 'DistributionId').OutputValue
Invoke-Aws -Arguments @('s3','sync','web/',"s3://$bucket/",'--region',$Region,'--cache-control','public,max-age=300')
Invoke-Aws -Arguments @('cloudfront','create-invalidation','--distribution-id',$distribution,'--paths','/*') | Out-Null
$outputs | Format-Table OutputKey,OutputValue
Write-Host 'CloudFront 배포와 캐시 무효화 완료 후 scripts/verify.ps1로 확인하세요.'
