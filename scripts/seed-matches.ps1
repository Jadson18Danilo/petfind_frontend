$ErrorActionPreference = 'Stop'
$api = 'http://localhost:4000'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$profiles = @(
  @{ name='Ana Seed'; email="ana.seed.$stamp@petfind.local"; password='123456'; species='gato'; sex='femea'; breed='Siames'; age=24; city='Sao Paulo'; state='SP' },
  @{ name='Bruno Seed'; email="bruno.seed.$stamp@petfind.local"; password='123456'; species='gato'; sex='macho'; breed='Persa'; age=30; city='Sao Paulo'; state='SP' },
  @{ name='Carla Seed'; email="carla.seed.$stamp@petfind.local"; password='123456'; species='gato'; sex='femea'; breed='Maine Coon'; age=18; city='Campinas'; state='SP' },
  @{ name='Diego Seed'; email="diego.seed.$stamp@petfind.local"; password='123456'; species='gato'; sex='macho'; breed='SRD'; age=20; city='Campinas'; state='SP' },
  @{ name='Eva Seed'; email="eva.seed.$stamp@petfind.local"; password='123456'; species='cachorro'; sex='femea'; breed='Labrador'; age=26; city='Curitiba'; state='PR' },
  @{ name='Felipe Seed'; email="felipe.seed.$stamp@petfind.local"; password='123456'; species='cachorro'; sex='macho'; breed='Poodle'; age=22; city='Curitiba'; state='PR' },
  @{ name='Gabi Seed'; email="gabi.seed.$stamp@petfind.local"; password='123456'; species='cachorro'; sex='femea'; breed='Vira-lata'; age=14; city='Florianopolis'; state='SC' },
  @{ name='Hugo Seed'; email="hugo.seed.$stamp@petfind.local"; password='123456'; species='cachorro'; sex='macho'; breed='Golden'; age=28; city='Florianopolis'; state='SC' }
)

$accounts = New-Object System.Collections.ArrayList

foreach ($p in $profiles) {
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $regBody = @{ name=$p.name; email=$p.email; password=$p.password } | ConvertTo-Json
  Invoke-RestMethod -Uri "$api/api/auth/register" -Method Post -WebSession $session -ContentType 'application/json' -Body $regBody | Out-Null

  $petBody = @{
    name = "Pet $($p.name.Split(' ')[0])"
    species = $p.species
    breed = $p.breed
    sex = $p.sex
    ageMonths = $p.age
    description = "Perfil seed de $($p.species)"
    city = $p.city
    state = $p.state
  } | ConvertTo-Json

  $pet = Invoke-RestMethod -Uri "$api/api/pets" -Method Post -WebSession $session -ContentType 'application/json' -Body $petBody

  [void]$accounts.Add([PSCustomObject]@{
    email = $p.email
    session = $session
    petId = [int]$pet.id
  })
}

$pairs = @(
  @(0,1), @(2,3), @(4,5), @(6,7),
  @(0,3), @(1,2), @(4,7), @(5,6),
  @(0,5), @(1,4), @(2,7), @(3,6)
)

$matchEvents = 0
foreach ($pair in $pairs) {
  $a = $accounts[$pair[0]]
  $b = $accounts[$pair[1]]

  $likeA = @{ fromPetId = $a.petId } | ConvertTo-Json
  Invoke-RestMethod -Uri "$api/api/pets/$($b.petId)/like" -Method Post -WebSession $a.session -ContentType 'application/json' -Body $likeA | Out-Null

  $likeB = @{ fromPetId = $b.petId } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri "$api/api/pets/$($a.petId)/like" -Method Post -WebSession $b.session -ContentType 'application/json' -Body $likeB
  if ($resp.matched -eq $true) { $matchEvents++ }
}

Write-Output "SEED_USERS_CREATED=$($accounts.Count)"
Write-Output "SEED_PETS_CREATED=$($accounts.Count)"
Write-Output "SEED_MATCH_EVENTS=$matchEvents"
Write-Output "SEED_EMAILS_START"
$accounts | ForEach-Object { Write-Output $_.email }
Write-Output "SEED_EMAILS_END"
