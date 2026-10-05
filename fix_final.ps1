$content = Get-Content 'client/src/app/dashboard/page.tsx' -Raw -Encoding UTF8
$content = $content -replace 'color: \s*ar\(--amber\)', "color: 'var(--amber)'"
$content = $content -replace '<span\>dY[^<]*Browse Workouts<\/span>', '<span>?? Browse Workouts</span>'
$content = $content -replace '<span\>dY[^<]*Log Weight<\/span>', '<span>?? Log Weight</span>'
$content = $content -replace '<span style=\{\{ color: ''var\(--amber\)'' \}\}\>dY[^<]*Scan Check-in<\/span>', '<span style={{ color: ''var(--amber)'' }}>?? Scan Check-in</span>'
$content = $content -replace 'dY"', '??'
$content = $content -replace '\+''', '?'
$content = $content -replace 'dY"', '??'
Set-Content 'client/src/app/dashboard/page.tsx' -Value $content -Encoding UTF8
