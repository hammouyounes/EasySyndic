package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.ActivityLog;
import java.util.List;

public interface ActivityLogService {
    void log(String action, String targetType, String description, String performedBy);
    List<ActivityLog> getRecentActivities();
}
