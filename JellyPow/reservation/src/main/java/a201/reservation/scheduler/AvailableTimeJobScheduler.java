package a201.reservation.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AvailableTimeJobScheduler {

    private final JobLauncher jobLauncher;
    private final Job availableTimeBatchJob;

    @Scheduled(cron = "0 10 0 * * *")
    public void runDaily() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("runAt", LocalDateTime.now().toString())
                .toJobParameters();

        jobLauncher.run(availableTimeBatchJob, params);
    }
}
