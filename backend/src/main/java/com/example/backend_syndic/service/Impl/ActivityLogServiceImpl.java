package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.ActivityLogRepository;
import com.example.backend_syndic.entity.ActivityLog;
import com.example.backend_syndic.service.facade.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public void log(String action, String targetType, String description, String performedBy) {
        ActivityLog log = new ActivityLog(action, targetType, description, performedBy);
        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop10ByOrderByTimestampDesc();
    }
}
