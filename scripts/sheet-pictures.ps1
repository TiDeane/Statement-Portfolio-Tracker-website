param([string]$Book, [string]$Out, [int]$Scale = 3)
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
  $wb = $excel.Workbooks.Open($Book, 0, $true)
  foreach ($pair in @(@('Current Holdings','sheet-holdings'), @('Portfolio History','sheet-history'))) {
    $ws = $wb.Worksheets.Item($pair[0])
    $ws.Calculate()
    $range = $ws.UsedRange
    $range.CopyPicture(1, -4147) | Out-Null   # as shown on screen, as a vector picture
    $w = $range.Width * $Scale; $h = $range.Height * $Scale
    $co = $ws.ChartObjects().Add(0, 0, $w, $h)
    $co.Chart.ChartArea.Format.Line.Visible = 0
    $co.Activate()
    Start-Sleep -Milliseconds 300
    $co.Chart.Paste()
    $pic = $co.Chart.Shapes.Item($co.Chart.Shapes.Count)
    $pic.LockAspectRatio = 0
    $pic.Left = 0; $pic.Top = 0; $pic.Width = $w; $pic.Height = $h
    $co.Chart.Export("$Out\$($pair[1]).png", "PNG") | Out-Null
    $co.Delete()
    "$($pair[1]) ok"
  }
  $wb.Close($false)
} finally {
  $excel.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
