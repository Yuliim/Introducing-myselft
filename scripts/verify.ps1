param([Parameter(Mandatory)][string]$CloudFrontUrl, [Parameter(Mandatory)][string]$S3DirectUrl)
$ErrorActionPreference = 'Stop'
function Get-Status([string]$Url) {
  try { return [int](Invoke-WebRequest -Uri $Url -UseBasicParsing).StatusCode }
  catch { if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }; throw }
}
$cloud = Get-Status ($CloudFrontUrl.TrimEnd('/') + '/index.html')
$s3 = Get-Status $S3DirectUrl
Write-Host "CloudFront: $cloud / S3 direct: $s3"
if ($cloud -ne 200 -or $s3 -ne 403) { throw '검증 실패: CloudFront 200 / S3 직접 접근 403이 필요합니다.' }
Write-Host '검증 성공. 각 URL을 로그아웃 또는 시크릿 브라우저에서도 열어 캡처하세요.'
