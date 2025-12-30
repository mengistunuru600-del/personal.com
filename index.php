<?php
// index.php
session_start();

// Initialize events in session if not set
if (!isset($_SESSION['events'])) {
    $_SESSION['events'] = [
        [
            'title' => 'Morning Run',
            'date'  => '2026-01-02',
            'start' => '06:30',
            'end'   => '07:15',
            'notes' => 'Neighborhood route'
        ],
        [
            'title' => 'Team Standup',
            'date'  => '2026-01-02',
            'start' => '09:00',
            'end'   => '09:30',
            'notes' => 'Zoom'
        ],
        [
            'title' => 'Write Blog Draft',
            'date'  => '2026-01-03',
            'start' => '14:00',
            'end'   => '16:00',
            'notes' => 'Personal site'
        ],
    ];
}

// Handle new event submission
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $date  = trim($_POST['date'] ?? '');
    $start = trim($_POST['start'] ?? '');
    $end   = trim($_POST['end'] ?? '');
    $notes = trim($_POST['notes'] ?? '');

    // Simple validation
    if ($title === '') { $errors[] = 'Title is required.'; }
    if ($date === '') { $errors[] = 'Date is required.'; }
    if ($start === '') { $errors[] = 'Start time is required.'; }
    if ($end === '') { $errors[] = 'End time is required.'; }

    // Optional: ensure end >= start
    if ($start !== '' && $end !== '' && strtotime($end) < strtotime($start)) {
        $errors[] = 'End time cannot be earlier than start time.';
    }

    if (empty($errors)) {
        $_SESSION['events'][] = [
            'title' => $title,
            'date'  => $date,
            'start' => $start,
            'end'   => $end,
            'notes' => $notes
        ];
        // Redirect to avoid resubmission on refresh
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}

// Sort events by date, then start time
$events = $_SESSION['events'];
usort($events, function($a, $b) {
    $dateCmp = strcmp($a['date'], $b['date']);
    if ($dateCmp !== 0) return $dateCmp;
    return strcmp($a['start'], $b['start']);
});

// Group events by date
$grouped = [];
foreach ($events as $ev) {
    $grouped[$ev['date']][] = $ev;
}

function h($str) { return htmlspecialchars($str, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Personal Page — Schedule</title>
    <style>
        :root {
            --bg: #0f172a;
            --panel: #111827;
            --text: #e5e7eb;
            --muted: #9ca3af;
            --accent: #22d3ee;
            --accent2: #a78bfa;
            --border: #1f2937;
            --success: #10b981;
            --danger: #ef4444;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background: linear-gradient(120deg, #0f172a 0%, #1f2937 100%);
            color: var(--text);
        }
        header {
            padding: 2rem 1.25rem;
            border-bottom: 1px solid var(--border);
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(6px);
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 1.25rem; }
        h1 {
            margin: 0;
            font-size: 2rem;
            letter-spacing: 0.3px;
        }
        .subtitle { color: var(--muted); margin-top: 0.25rem; }
        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
        }
        @media (min-width: 900px) {
            .grid {
                grid-template-columns: 2fr 1fr;
            }
        }
        .card {
            background: rgba(17, 24, 39, 0.6);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }
        .card h2 {
            margin: 0 0 0.75rem;
            font-size: 1.25rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 10px;
        }
        thead th {
            text-align: left;
            font-weight: 600;
            color: var(--muted);
            border-bottom: 1px solid var(--border);
            padding: 0.75rem;
            background: rgba(17, 24, 39, 0.55);
        }
        tbody tr {
            border-bottom: 1px solid var(--border);
        }
        tbody td {
            padding: 0.75rem;
            vertical-align: top;
        }
        .date-row {
            background: linear-gradient(90deg, rgba(34, 211, 238, 0.1), rgba(167, 139, 250, 0.1));
            font-weight: 600;
            color: var(--text);
        }
        .badge {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 999px;
            font-size: 0.75rem;
            background: rgba(34, 211, 238, 0.15);
            border: 1px solid rgba(34, 211, 238, 0.35);
            color: #9bf0ff;
        }
        .muted { color: var(--muted); font-size: 0.9rem; }
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .form-grid .full { grid-column: 1 / -1; }
        label {
            display: block;
            font-size: 0.85rem;
            color: var(--muted);
            margin-bottom: 0.25rem;
        }
        input[type="text"], input[type="date"], input[type="time"], textarea {
            width: 100%;
            background: rgba(17, 24, 39, 0.7);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            padding: 0.5rem 0.6rem;
        }
        textarea { min-height: 80px; resize: vertical; }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.55rem 0.9rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: linear-gradient(180deg, rgba(34, 211, 238, 0.25), rgba(167, 139, 250, 0.25));
            color: var(--text);
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.1s ease, opacity 0.1s ease;
        }
        .btn:hover { transform: translateY(-1px); opacity: 0.95; }
        .btn-secondary {
            background: rgba(17, 24, 39, 0.7);
        }
        .errors {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.35);
            color: #fecaca;
            border-radius: 8px;
            padding: 0.75rem;
            margin-bottom: 0.75rem;
        }
        footer {
            padding: 1.25rem;
            text-align: center;
            color: var(--muted);
        }
        .header-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }
        .pill {
            padding: 0.35rem 0.65rem;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: rgba(17,24,39,0.55);
            color: var(--muted);
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
<header>
    <div class="container">
        <h1>Hi, I'm [Your Name]</h1>
        <div class="subtitle">Welcome to my personal page. Below is my schedule and a quick way to add plans.</div>
        <div class="header-actions">
            <span class="pill">Location: Oromia Region</span>
            <span class="pill">Timezone: Africa/Addis_Ababa</span>
        </div>
    </div>
</header>

<main class="container">
    <div class="grid">
        <section class="card">
            <h2>Schedule</h2>
            <?php if (empty($events)): ?>
                <p class="muted">No events yet. Add one using the form.</p>
            <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 20%;">Time</th>
                            <th style="width: 35%;">Title</th>
                            <th style="width: 30%;">Notes</th>
                            <th style="width: 15%;">Tag</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($grouped as $date => $list): ?>
                            <tr class="date-row">
                                <td colspan="4">
                                    <?php
                                        $ts = strtotime($date);
                                        echo date('D, M j, Y', $ts);
                                    ?>
                                </td>
                            </tr>
                            <?php foreach ($list as $ev): ?>
                                <tr>
                                    <td>
                                        <span class="badge"><?php echo h($ev['start']); ?>–<?php echo h($ev['end']); ?></span>
                                    </td>
                                    <td><?php echo h($ev['title']); ?></td>
                                    <td class="muted"><?php echo $ev['notes'] !== '' ? h($ev['notes']) : '—'; ?></td>
                                    <td>
                                        <?php
                                            // Simple tag based on time of day
                                            $hour = (int)date('H', strtotime($ev['start']));
                                            $tag = $hour < 12 ? 'Morning' : ($hour < 17 ? 'Afternoon' : 'Evening');
                                        ?>
                                        <span class="badge"><?php echo $tag; ?></span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>

        <aside class="card">
            <h2>Add an event</h2>
            <?php if (!empty($errors)): ?>
                <div class="errors">
                    <?php foreach ($errors as $e): ?>
                        <div>• <?php echo h($e); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="post" action="">
                <div class="form-grid">
                    <div class="full">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" placeholder="e.g., Client call" required />
                    </div>

                    <div>
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" required />
                    </div>

                    <div>
                        <label for="start">Start time</label>
                        <input type="time" id="start" name="start" required />
                    </div>

                    <div>
                        <label for="end">End time</label>
                        <input type="time" id="end" name="end" required />
                    </div>

                    <div class="full">
                        <label for="notes">Notes</label>
                        <textarea id="notes" name="notes" placeholder="Optional details"></textarea>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn" type="submit">Add event</button>
                    <a class="btn btn-secondary" href="<?php echo h($_SERVER['PHP_SELF']); ?>">Refresh</a>
                </div>
            </form>

            <p class="muted" style="margin-top:0.75rem;">
                Events are stored in your session. To permanently store events, switch to a database or a small JSON file.
            </p>
        </aside>
    </div>
</main>

<footer>
    © <?php echo date('Y'); ?> · Built with PHP + HTML. Customize colors, fonts, and layout as you like.
</footer>
</body>
</html>
