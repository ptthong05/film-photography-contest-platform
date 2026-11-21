param()

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$container = 'filmcontest-tv3-mysql-1'
$mysql = docker inspect $container | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or !$mysql) { throw 'Start the dedicated TV3 MySQL container first.' }
if ($mysql[0].Config.Labels.'com.docker.compose.project' -ne 'filmcontest-tv3') {
    throw 'Container does not belong to the filmcontest-tv3 project.'
}
if (!$mysql[0].State.Running) { throw 'Run docker start filmcontest-tv3-mysql-1 first.' }

$previousUrl = $env:TV3_TEST_MYSQL_URL
$previousUser = $env:TV3_TEST_MYSQL_USER
$previousPassword = $env:TV3_TEST_MYSQL_PASSWORD
try {
    foreach ($entry in $mysql[0].Config.Env) {
        if ($entry.StartsWith('MYSQL_USER=')) { $env:TV3_TEST_MYSQL_USER = $entry.Substring(11) }
        if ($entry.StartsWith('MYSQL_PASSWORD=')) { $env:TV3_TEST_MYSQL_PASSWORD = $entry.Substring(15) }
    }
    $env:TV3_TEST_MYSQL_URL = 'jdbc:mysql://mysql:3306/filmcontest_tv3?connectionTimeZone=UTC'
    # This database must remain dedicated to tests; concurrency tests commit their own fixtures.
    # Windows PowerShell 5 may otherwise treat benign JVM stderr warnings as terminating errors.
    $ErrorActionPreference = 'Continue'
    docker run --rm --name filmcontest-tv3-tests --network filmcontest-tv3_default `
        -v "${workspace}:/work" -v filmcontest-tv3-maven-cache:/root/.m2 `
        -e TV3_TEST_MYSQL_URL -e TV3_TEST_MYSQL_USER -e TV3_TEST_MYSQL_PASSWORD `
        -w /work/src/backend maven:3.9.9-eclipse-temurin-17 mvn -B -ntp clean verify
    $verificationExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($verificationExit -ne 0) { throw "Maven verification failed: $verificationExit" }
} finally {
    $env:TV3_TEST_MYSQL_URL = $previousUrl
    $env:TV3_TEST_MYSQL_USER = $previousUser
    $env:TV3_TEST_MYSQL_PASSWORD = $previousPassword
}
