# Find large files in the repository
git rev-list --objects --all | \
    Select-Object @{name="hash"; expression={$_.Substring(0, $_.IndexOf(' '))}}, \
                 @{name="file"; expression={$_.Substring($_.IndexOf(' ')+1)}} | \
    ForEach-Object { 
        $size = (git cat-file -s $_.hash) 
        if ($size -gt 100000) {  # Files larger than 100KB
            [PSCustomObject]@{
                SizeKB = [math]::Round($size/1KB, 2)
                Hash = $_.hash
                File = $_.file
            } 
        } 
    } | Sort-Object -Property SizeKB -Descending
