-- Add sync columns to calendars table
ALTER TABLE calendars 
ADD COLUMN sync_token VARCHAR(32),
ADD COLUMN last_sync_time TIMESTAMP;

-- Add busy_status to events table
ALTER TABLE events
ADD COLUMN busy_status ENUM('busy', 'free', 'tentative') NOT NULL DEFAULT 'busy';

-- Add indexes for better performance
CREATE INDEX idx_calendar_sync ON calendars(sync_token);
CREATE INDEX idx_calendar_last_sync ON calendars(last_sync_time);
CREATE INDEX idx_event_busy_status ON events(busy_status);
