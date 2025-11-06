package a201.reservation.global.config;

import a201.reservation.domain.availableTime.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;


@Configuration
@RequiredArgsConstructor
public class AvailableTimeBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final AvailableTimeService availableTimeService;

    @Bean
    public Job availableTimeBatchJob() {
        return new JobBuilder("slideAvailableTimeJob", jobRepository)
                .start(slideAvailableTimeStep())
                .build();
    }

    @Bean
    public Step slideAvailableTimeStep() {
        return new StepBuilder("slideAvailableTimeStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    availableTimeService.slideOneDay();
                    return RepeatStatus.FINISHED;
                }, transactionManager)
        .build();
    }

}
