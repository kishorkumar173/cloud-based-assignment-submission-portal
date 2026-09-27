# Manual Test Cases

| ID | Scenario | Input | Expected |
|---|---|---|---|
| T01 | Student registration | valid student data | account created |
| T02 | Teacher login | valid credentials | teacher token returned |
| T03 | Invalid login | wrong password | 401 |
| T04 | Student opens teacher route | student token | frontend redirects / API returns 403 |
| T05 | Teacher creates assignment | valid course + fields | 200 |
| T06 | Student views assignment | student token | assignment list |
| T07 | Valid PDF upload | PDF under limit | submission created |
| T08 | Invalid extension | EXE | 400 |
| T09 | Oversized file | > configured MB | 413 |
| T10 | On-time upload | timestamp <= deadline | SUBMITTED |
| T11 | Late upload | timestamp > deadline | LATE |
| T12 | Resubmission | second version | version increments |
| T13 | Own submission | student token | allowed |
| T14 | Other student's submission | wrong student | 403 |
| T15 | Teacher review | teacher token | submissions returned |
| T16 | Grade | marks <= max | GRADED |
| T17 | Excess marks | marks > max | 422 |
| T18 | Feedback | teacher text | student can read |
| T19 | Unauthorized grading | student token | 403 |
| T20 | File download | authorized user | file returned |
| T21 | Storage failure | unavailable storage | 503 |
| T22 | Database failure | unavailable DB | service error; no silent success |
| T23 | Logout | remove token | protected calls fail |
