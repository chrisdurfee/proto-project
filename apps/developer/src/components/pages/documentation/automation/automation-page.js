import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../doc-page.js";

/**
 * CodeBlock
 *
 * Creates a code block with copy-to-clipboard functionality.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const CodeBlock = Atom((props, children) => (
	Pre(
		{
			...props,
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto
					 rounded-lg border bg-muted whitespace-break-spaces
					 break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: 'font-mono flex-auto text-sm text-wrap',
					click: () => {
						navigator.clipboard.writeText(children[0].textContent);
						// @ts-ignore
						app.notify({
							title: "Code copied",
							description: "The code has been copied to your clipboard.",
							icon: null
						});
					}
				},
				children
			)
		]
	)
));

/**
 * AutomationPage
 *
 * This page documents Proto's automation system including jobs, processes,
 * background tasks, cron jobs, and the server automation system.
 *
 * @returns {DocPage}
 */
export const AutomationPage = () =>
	DocPage(
		{
			title: 'Automation & Background Processing',
			description: 'Learn how to create automated tasks, background jobs, cron processes, and server automation in Proto.'
		},
		[
			// Overview
			Section({ class: 'space-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto provides a comprehensive automation system for background processing, scheduled tasks,
					and long-running processes. The automation system includes job queues, cron scheduling,
					process management, and performance benchmarking.`
				)
			]),

			// Jobs System
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Background Jobs System'),
				P({ class: 'text-muted-foreground' },
					`Proto includes a comprehensive jobs system for background processing. Jobs are processed
					using the JobWorkerRoutine, scheduled with JobSchedulerRoutine, and maintained with JobCleanupRoutine.`
				),
				P({ class: 'text-muted-foreground' },
					`Create a job class in the Common/Jobs folder:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Common\\Jobs;

/**
 * ExampleJob
 *
 * Example job class for background processing.
 */
class ExampleJob
{
    /**
     * Execute the job.
     *
     * @param array $data The job data
     * @return void
     */
    public function handle(array $data): void
    {
        // Your job logic here
        $email = $data['email'] ?? null;

        if ($email) {
            // Process the email
            modules()->email()->send($email, $data['settings'] ?? []);
        }

        // Log completion
        error_log("ExampleJob completed for email: {$email}");
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`Run the job worker to process queued jobs:`
				),
				CodeBlock(
`// Process jobs from default queue
$worker = new Proto\\Automation\\Processes\\Jobs\\JobWorkerRoutine();
$worker->run();

// Process specific queue with options
$worker = new Proto\\Automation\\Processes\\Jobs\\JobWorkerRoutine(
    null,           // date
    'emails',       // queue name
    10,             // max jobs to process
    true            // verbose output
);
$worker->run();`
				)
			]),

			// Process System
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Automation Routines'),
				P({ class: 'text-muted-foreground' },
					`Proto provides automation routines that extend the base Routine class.
					These include JobWorkerRoutine, JobSchedulerRoutine, and JobCleanupRoutine
					for comprehensive job system management.`
				),
				P({ class: 'text-muted-foreground' },
					`The JobWorkerRoutine processes jobs from queues:`
				),
				CodeBlock(
`use Proto\\Automation\\Processes\\Jobs\\JobWorkerRoutine;

// Create a job worker with options
$worker = new JobWorkerRoutine(
    null,           // date (optional)
    'default',      // queue name
    100,            // max jobs (0 = unlimited)
    true            // verbose output
);

// Configure additional options
$worker->setQueueName('high-priority')
       ->setMaxJobs(50)
       ->setVerbose(true);

// Run the worker
$worker->run();`
				),
				P({ class: 'text-muted-foreground' },
					`The JobSchedulerRoutine handles scheduled job execution:`
				),
				CodeBlock(
`use Proto\\Automation\\Processes\\Jobs\\JobSchedulerRoutine;

// Create and run job scheduler
$scheduler = new JobSchedulerRoutine(null, true); // verbose output
$scheduler->run();

// The scheduler automatically processes scheduled jobs
// and moves them to the appropriate queues`
				),
				P({ class: 'text-muted-foreground' },
					`The JobCleanupRoutine maintains the job system by cleaning old records:`
				),
				CodeBlock(
`use Proto\\Automation\\Processes\\Jobs\\JobCleanupRoutine;

// Create and run cleanup routine
$cleanup = new JobCleanupRoutine(null, true); // verbose output
$cleanup->run();

// Cleans up completed, failed, and expired job records
// to maintain database performance`
				)
			]),

			// Benchmarking
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Routine Benchmarking'),
				P({ class: 'text-muted-foreground' },
					`All automation routines include built-in benchmarking to monitor
					performance and execution times. Routines automatically track
					their total execution time.`
				),
				CodeBlock(
`// All routines include automatic benchmarking
$worker = new JobWorkerRoutine(null, 'default', 10, true);
$worker->run();

// Output includes execution time information:
// Job worker routine completed
// Jobs processed: 10
// Execution time: 2.34 seconds

// Custom routines can extend the base Routine class
use Proto\\Automation\\Processes\\Routine;

class CustomRoutine extends Routine
{
    protected function process(): void
    {
        // Your routine logic
        // Benchmark is automatically available as $this->benchmark

        echo "Execution time: " . $this->benchmark->getTotal() . " seconds\\n";
    }
}`
				)
			]),

			// Configuration
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Job System Usage'),
				P({ class: 'text-muted-foreground' },
					`The job system uses a database driver for queue management.
					Jobs are stored in database tables and processed by worker routines.`
				),
				CodeBlock(
`// Example job queue usage with Proto\\Jobs\\JobQueue
use Proto\\Jobs\\JobQueue;
use Proto\\Jobs\\Drivers\\DatabaseDriver;

// Initialize job queue
$driver = new DatabaseDriver();
$queue = new JobQueue([], $driver);

// Check queue statistics
$stats = $driver->getStats('default');
echo "Pending jobs: " . $stats['pending'] . "\\n";
echo "Processing: " . $stats['processing'] . "\\n";
echo "Completed: " . $stats['completed'] . "\\n";
echo "Failed: " . $stats['failed'] . "\\n";

// Process jobs from queue
$queue->work('default', 5); // Process 5 jobs from default queue`
				)
			]),

			// Best Practices
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Best Practices'),
				Ul({ class: 'list-disc pl-6 space-y-1 text-muted-foreground' }, [
					Li("Always include error handling and logging in jobs and processes"),
					Li("Set appropriate memory and time limits for long-running processes"),
					Li("Use benchmarking to monitor performance and identify bottlenecks"),
					Li("Implement graceful failure handling with retry mechanisms"),
					Li("Keep job payloads small and avoid storing large objects"),
					Li("Use queues for high-volume background processing"),
					Li("Monitor automation server health and resource usage"),
					Li("Implement proper cleanup for temporary files and resources")
				])
			])
		]
	);

export default AutomationPage;
