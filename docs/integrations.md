# Integration

Janus comes with in-built integrations for acceptance tests.

Currently supported platforms:
  - [Pivotal Tracker](#pivotal-tracker)  

## Pivotal Tracker Acceptance Toggles

### Things you'll need
1. Pivotal Tracker API Key

### Getting what you need
1. Login to Pivotal Tracker
2. Go to [your profile page](https://www.pivotaltracker.com/profile) at this link: https://www.pivotaltracker.com/profile.
3. Scroll to the bottom of the page and you should see an **API Token** section, this contains your API Key

### Using the key
When starting Janus, register a new environment variable named `PIVOTAL_TRACKER_API_KEY` containing the API Key.

You will now be able to specify feature toggles of `acceptance` types:

```yaml
acceptance_feature:
  development: true
  production:
    type: acceptance
    source: pivotal
    state: delivered
    values: # Array<storyId>
      - 1234567
      - 7654321
```