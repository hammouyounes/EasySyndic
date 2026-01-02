package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.ActivityLog;
import com.example.backend_syndic.service.facade.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public List<ActivityLog> getRecentActivities() {
        return activityLogService.getRecentActivities();
    }
}
