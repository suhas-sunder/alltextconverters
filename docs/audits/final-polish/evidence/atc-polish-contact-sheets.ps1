param([string]$VisualDirectory = "$env:TEMP/atc-polish-hosted-after")
Add-Type -AssemblyName System.Drawing
function Write-Sheet($Files, $Output, $Columns, $CellWidth, $CellHeight) {
 $rows=[int][Math]::Ceiling($Files.Count/$Columns)
 $canvas=[Drawing.Bitmap]::new($Columns*$CellWidth,$rows*$CellHeight)
 $g=[Drawing.Graphics]::FromImage($canvas);$g.Clear([Drawing.Color]::White);$font=[Drawing.Font]::new('Arial',10)
 for($i=0;$i -lt $Files.Count;$i++) {
  $src=[Drawing.Image]::FromFile($Files[$i].FullName);$ratio=[Math]::Min(($CellWidth-6)/$src.Width,($CellHeight-30)/$src.Height)
  $x=($i%$Columns)*$CellWidth;$y=[Math]::Floor($i/$Columns)*$CellHeight
  $g.DrawImage($src,[Drawing.Rectangle]::new($x,$y+25,[int]($src.Width*$ratio),[int]($src.Height*$ratio)))
  $label=$Files[$i].BaseName; if($Columns -eq 6){$label=$label.Substring(4); if($label.Length -gt 25){$label=$label.Substring(0,25)}}; $g.DrawString($label,$font,[Drawing.Brushes]::Black,$x+2,$y+3);$src.Dispose()
 }
 $canvas.Save($Output);$font.Dispose();$g.Dispose();$canvas.Dispose()
}
$mobile=@(Get-ChildItem -LiteralPath $VisualDirectory -Filter '375-*.png' | Sort-Object Name)
for($start=0;$start -lt $mobile.Count;$start+=12){$last=[Math]::Min($start+11,$mobile.Count-1);Write-Sheet @($mobile[$start..$last]) (Join-Path $VisualDirectory "sheet-$start.png") 6 200 500}
foreach($width in @(320,768,1280,1920)){$shots=@(Get-ChildItem -LiteralPath $VisualDirectory -Filter "$width-*.png" | Sort-Object Name);$height=if($width -eq 320){500}else{300};Write-Sheet $shots (Join-Path $VisualDirectory "width-$width.png") 4 400 $height}
