$(document).ready(function () {
    $(document).foundation();

    $('#taskTable').on('click', '.task-group-header', function() {
        var togglerClass = $(this).data('toggler');
        $(togglerClass).toggle(); // Toggle visibility of elements with the class specified in data-toggler
    });

    function convertDayToNumber(dayName) {
        const days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
        return days.indexOf(dayName.trim()); // Use trim() to remove any extra whitespace
    }

    function segmentToTime(segment) {
        const totalMinutes = segment * 15; // Each segment is 15 minutes
        let hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    function calculateDuration(begin, end) {
        const durationMinutes = (end - begin) * 15;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    function appendJobToCategory(job, category, beginTime, endTime) {
        var $lastRow = $(`.task-group-header[data-toggler=".${category}"]`).last();
        var $newRow = $(`<tr class="task-details ${category}" style="display: none;">
            <td>${job.task} in ${job.room}</td>
            <td>${beginTime}</td>
            <td>${endTime}</td>
            <td>${calculateDuration(job.begin, job.end)}</td>
            <td>${job.day}</td>
        </tr>`);

        $newRow.insertAfter($lastRow);
    }

    const now = new Date();
    let currentDayOfWeek = now.getDay(); 
    currentDayOfWeek = currentDayOfWeek === 0 ? 7 : currentDayOfWeek; 
    const currentTime = now.getHours() * 4 + Math.floor(now.getMinutes() / 15); 

    $.ajax({
        url: '/household/gen_rota',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.statusCode === 200) {
                $.each(response.data, function(userId, user) {
                    $.each(user.jobs, function(index, job) {
                        var beginTime = segmentToTime(job.begin);
                        var endTime = segmentToTime(job.end);
                        var jobDay = convertDayToNumber(job.day); 
                        var jobBeginSegment = job.begin;

                        var category;
                        if ((jobDay === 0 && currentDayOfWeek === 1) || // Sunday tasks on Monday
                            (jobDay < currentDayOfWeek)) {
                            category = 'Missed'; // Tasks from previous week's Sunday or earlier days
                        } else if (jobDay === currentDayOfWeek && jobBeginSegment >= currentTime) {
                            category = 'In Progress'; // Tasks scheduled for today but not started yet
                        } else {
                            category = 'Upcoming'; // Tasks scheduled for future days
                        }

                        appendJobToCategory(job, category, beginTime, endTime);
                    });
                });
            } else {
                console.error('Failed to fetch data: ' + response.errorMessage);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data: ' + textStatus);
        }
    });
});
