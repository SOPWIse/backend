const exptReportTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOP Log Report</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #f8fafc;
            --border-color: #e2e8f0;
            --text-color: #334155;
            --success-color: #10b981;
            --pending-color: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: white;
            color: var(--text-color);
            font-size: 14px;
            line-height: 1.6;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--primary-color);
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
        }

        .report-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #111827;
        }

        .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            padding: 15px;
            background-color: var(--secondary-color);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .meta-item {
            flex: 1;
            min-width: 200px;
        }

        .meta-label {
            font-weight: bold;
            font-size: 13px;
            color: #64748b;
            text-transform: uppercase;
        }

        .meta-value {
            font-size: 16px;
            color: #334155;
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: capitalize;
        }

        .status-pending {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--pending-color);
        }

        .status-completed {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success-color);
        }

        .progress-container {
            margin-bottom: 30px;
            background-color: var(--secondary-color);
            border-radius: 8px;
            padding: 15px;
            border: 1px solid var(--border-color);
        }

        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .progress-title {
            font-weight: bold;
            font-size: 18px;
        }

        .progress-bar {
            height: 10px;
            background-color: #e2e8f0;
            border-radius: 5px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background-color: var(--primary-color);
        }

        .steps-container {
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }

        .steps-timeline {
            position: relative;
        }

        .timeline-line {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 15px;
            width: 2px;
            background-color: var(--border-color);
            z-index: -1;
        }

        .step {
            display: flex;
            margin-bottom: 20px;
            position: relative;
        }

        .step-marker {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: white;
            border: 2px solid var(--primary-color);
            margin-right: 20px;
            flex-shrink: 0;
        }

        .step-marker.completed {
            background-color: var(--primary-color);
            color: white;
        }

        .step-marker.pending {
            border-color: var(--pending-color);
            color: var(--pending-color);
        }

        .step-content {
            flex-grow: 1;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .step-title {
            font-weight: bold;
            font-size: 16px;
        }

        .step-time {
            color: #64748b;
            font-size: 13px;
        }

        .step-subtitle {
            color: #64748b;
            margin-bottom: 10px;
        }

        .form-data {
            background-color: #f8fafc;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #e2e8f0;
        }

        .form-item {
            margin-bottom: 8px;
        }

        .form-key {
            font-weight: bold;
            color: #64748b;
            font-size: 13px;
        }

        .form-value {
            word-break: break-word;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
        }

        @media print {
            body {
                padding: 20px;
            }
            
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SOPwise</div>
        <div class="date" id="generated-date"></div>
    </div>

    <div class="report-title" id="report-title"></div>
    
    <div class="meta-info">
        <div class="meta-item">
            <div class="meta-label">SOP ID</div>
            <div class="meta-value" id="sop-id"></div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Created By</div>
            <div class="meta-value" id="author-name"></div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Created At</div>
            <div class="meta-value" id="created-at"></div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Status</div>
            <div class="meta-value">
                <span class="status" id="status"></span>
            </div>
        </div>
    </div>

    <div class="progress-container">
        <div class="progress-header">
            <div class="progress-title">Completion Progress</div>
            <div class="progress-percentage" id="completion-percentage"></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
        </div>
    </div>

    <div class="steps-container">
        <div class="section-title">Steps</div>
        <div class="steps-timeline" id="steps-timeline">
            <div class="timeline-line"></div>
        </div>
    </div>

    <div class="footer">
        <div>Generated on <span id="footer-date"></span></div>
        <div>SOPwise - Standard Operating Procedure Management</div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // This function will be called by Puppeteer to inject the data
            function renderSopLogData(data) {
                if (!data) return;

                // Format date function
                function formatDate(dateString) {
                    const date = new Date(dateString);
                    return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }

                // Format time function (converts seconds to minutes and seconds)
                function formatTime(seconds) {
                    if (seconds < 60) return seconds + ' seconds';
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    return minutes + ' min' + (minutes !== 1 ? 's' : '') + ' ' + remainingSeconds + ' sec' + (remainingSeconds !== 1 ? 's' : '');
                }

                // Set basic information
                document.getElementById('report-title').textContent = data.title || 'SOP Execution Log';
                document.getElementById('sop-id').textContent = data.sopId || 'N/A';
                document.getElementById('author-name').textContent = data.authorName || 'N/A';
                document.getElementById('created-at').textContent = formatDate(data.createdAt) || 'N/A';
                
                const now = new Date();
                const formattedDate = now.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                document.getElementById('generated-date').textContent = 'Generated: ' + formattedDate;
                document.getElementById('footer-date').textContent = formattedDate;

                // Set status
                const statusElement = document.getElementById('status');
                statusElement.textContent = data.status || 'N/A';
                statusElement.className = 'status status-' + data.status.toLowerCase();

                // Set completion percentage
                const completionPercentage = data.completion_percentage || 0;
                document.getElementById('completion-percentage').textContent = completionPercentage + '%';
                document.getElementById('progress-fill').style.width = completionPercentage + '%';

                // Render steps
                const stepsTimeline = document.getElementById('steps-timeline');
                
                if (data.steps && data.steps.length > 0) {
                    data.steps.forEach((step, index) => {
                        const stepElement = document.createElement('div');
                        stepElement.className = 'step';
                        
                        const isCompleted = step.meta_data && step.meta_data.isCompleted;
                        
                        stepElement.innerHTML =
                            '<div class="step-marker ' + (isCompleted ? 'completed' : 'pending') + '">' +
                                (index + 1) +
                            '</div>' +
                            '<div class="step-content">' +
                                '<div class="step-header">' +
                                    '<div class="step-title">' + (step.title || 'Untitled Step') + '</div>' +
                                    '<div class="step-time">Time: ' + formatTime(step.time_taken || 0) + '</div>' +
                                '</div>' +
                                (step.subtitle ? '<div class="step-subtitle">' + step.subtitle + '</div>' : '') +
                                renderFormData(step.form_data) +
                            '</div>';
                        
                        stepsTimeline.appendChild(stepElement);
                    });
                } else {
                    stepsTimeline.innerHTML = '<p>No steps available</p>';
                }

                // Helper function to render form data
                function renderFormData(formData) {
                    if (!formData || Object.keys(formData).length === 0) return '';
                    
                    let formHtml = '<div class="form-data">';
                    
                    for (const [key, value] of Object.entries(formData)) {
                        formHtml +=
                            '<div class="form-item">' +
                                '<div class="form-key">Field ID: ' + key + '</div>' +
                                '<div class="form-value">' + value + '</div>' +
                            '</div>';
                    }
                    
                    formHtml += '</div>';
                    return formHtml;
                }
            }

            // This makes the function available globally for Puppeteer
            window.renderSopLogData = renderSopLogData;
        });
    </script>
</body>
</html>
`;
