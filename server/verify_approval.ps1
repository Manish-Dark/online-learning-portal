$ErrorActionPreference = "Stop"

function Test-Step {
    param($Name, $ScriptBlock)
    Write-Host "Testing: $Name..." -NoNewline
    try {
        & $ScriptBlock
        Write-Host " [PASS]" -ForegroundColor Green
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "Error: $_"
        exit 1
    }
}

# 1. Admin Login
$adminToken = ""
Test-Step "Admin Login" {
    $body = @{email="manish1212@gmail.com"; password="manish@2004"; role="admin"} | ConvertTo-Json
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/auth/login" -ContentType "application/json" -Body $body
    if (-not $response.token) { throw "No token returned" }
    $global:adminToken = $response.token
}

# 2. List Pending Students
$studentId = ""
Test-Step "List Pending Students" {
    $headers = @{Authorization="Bearer $adminToken"}
    $response = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/admin/students/pending" -Headers $headers
    
    # Find our test student
    $student = $response | Where-Object { $_.email -eq "teststudent6@example.com" }
    if (-not $student) { throw "Test user 'teststudent6@example.com' not found in pending list" }
    $global:studentId = $student._id
}

# 3. Approve Student
Test-Step "Approve Student" {
    $headers = @{Authorization="Bearer $adminToken"}
    $response = Invoke-RestMethod -Method Put -Uri "http://localhost:5000/admin/students/$studentId/approve" -Headers $headers
    if ($response.isApproved -ne $true) { throw "Student was not approved" }
}

# 4. Student Login (Approved)
Test-Step "Student Login (Approved)" {
    $body = @{email="teststudent6@example.com"; password="password123"; role="student"} | ConvertTo-Json
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/auth/login" -ContentType "application/json" -Body $body
    if (-not $response.token) { throw "No token returned for approved student" }
}

Write-Host "`nAll verification steps passed!" -ForegroundColor Green
