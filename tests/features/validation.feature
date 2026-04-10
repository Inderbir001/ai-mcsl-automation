Feature: Requirement Validation

  Scenario: Primary Negative Path
    Given the user is on the target page
    When the user enters invalid data format
    Then the system should display an inline error message
    And the submit button should remain disabled