<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/src/helpers.php';
require_once dirname(__DIR__, 2) . '/src/db.php';

require_admin();
$pdo = db();

$entities = [
    'nations' => ['label' => 'Nations', 'table' => 'nations'],
    'packages' => ['label' => 'Packages', 'table' => 'packages'],
    'locations' => ['label' => 'Locations', 'table' => 'locations'],
    'tips' => ['label' => 'Tips', 'table' => 'tips'],
    'faqs' => ['label' => 'FAQs', 'table' => 'faqs'],
];
$entity = strtolower((string) ($_GET['entity'] ?? ''));
if (!isset($entities[$entity])) {
    http_response_code(404);
    exit('Unknown content type.');
}
$label = $entities[$entity]['label'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$action = (string) ($_GET['action'] ?? 'list');
$flash = consume_flash();

$nations = $pdo->query('SELECT id, name FROM nations ORDER BY sort_order, name')->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The session expired. Please try again.');
        header('Location: crud.php?entity=' . rawurlencode($entity));
        exit;
    }

    $operation = (string) ($_POST['operation'] ?? '');
    try {
        if ($operation === 'delete') {
            $deleteId = (int) ($_POST['id'] ?? 0);
            if ($deleteId > 0) {
                $stmt = $pdo->prepare("DELETE FROM {$entities[$entity]['table']} WHERE id = :id");
                $stmt->execute(['id' => $deleteId]);
                set_flash('success', $label . ' deleted.');
            }
        } elseif ($entity === 'nations') {
            $values = [
                'slug' => trim((string) ($_POST['slug'] ?? '')),
                'name' => trim((string) ($_POST['name'] ?? '')),
                'element' => trim((string) ($_POST['element'] ?? '')),
                'kicker' => trim((string) ($_POST['kicker'] ?? '')),
                'tagline' => trim((string) ($_POST['tagline'] ?? '')),
                'accent_color' => trim((string) ($_POST['accent_color'] ?? '#82d7bd')),
                'sort_order' => (int) ($_POST['sort_order'] ?? 0),
                'image_path' => trim((string) ($_POST['image_path'] ?? '')),
                'hero_alt' => trim((string) ($_POST['hero_alt'] ?? '')),
                'card_alt' => trim((string) ($_POST['card_alt'] ?? '')),
                'meta_description' => trim((string) ($_POST['meta_description'] ?? '')),
                'about_kicker' => trim((string) ($_POST['about_kicker'] ?? '')),
                'about_heading' => trim((string) ($_POST['about_heading'] ?? '')),
                'about_body' => trim((string) ($_POST['about_body'] ?? '')),
            ];
            if ($values['slug'] === '' || $values['name'] === '' || $values['image_path'] === '' || !preg_match('/^#[0-9a-fA-F]{6}$/', $values['accent_color'])) {
                throw new InvalidArgumentException('Slug, name, image path, and a valid 6-digit accent color are required.');
            }
            if ($operation === 'edit') {
                $values['id'] = (int) ($_POST['id'] ?? 0);
                $pdo->prepare('UPDATE nations SET slug=:slug,name=:name,element=:element,kicker=:kicker,tagline=:tagline,accent_color=:accent_color,sort_order=:sort_order,image_path=:image_path,hero_alt=:hero_alt,card_alt=:card_alt,meta_description=:meta_description,about_kicker=:about_kicker,about_heading=:about_heading,about_body=:about_body WHERE id=:id')->execute($values);
            } else {
                $pdo->prepare('INSERT INTO nations (slug,name,element,kicker,tagline,accent_color,sort_order,image_path,hero_alt,card_alt,meta_description,about_kicker,about_heading,about_body) VALUES (:slug,:name,:element,:kicker,:tagline,:accent_color,:sort_order,:image_path,:hero_alt,:card_alt,:meta_description,:about_kicker,:about_heading,:about_body)')->execute($values);
            }
            set_flash('success', 'Nation saved.');
        } elseif ($entity === 'packages') {
            $values = [
                'nation_id' => (int) ($_POST['nation_id'] ?? 0), 'title' => trim((string) ($_POST['title'] ?? '')),
                'description' => trim((string) ($_POST['description'] ?? '')), 'price_php' => (int) ($_POST['price_php'] ?? 0),
                'days' => (int) ($_POST['days'] ?? 0), 'nights' => (int) ($_POST['nights'] ?? 0),
                'badge' => trim((string) ($_POST['badge'] ?? '')), 'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                'is_active' => isset($_POST['is_active']) ? 1 : 0, 'sort_order' => (int) ($_POST['sort_order'] ?? 0),
            ];
            if ($values['nation_id'] < 1 || $values['title'] === '' || $values['description'] === '' || $values['price_php'] < 0 || $values['days'] < 1) {
                throw new InvalidArgumentException('Nation, title, description, price, and duration are required.');
            }
            $pdo->beginTransaction();
            if ($operation === 'edit') {
                $values['id'] = (int) ($_POST['id'] ?? 0);
                $pdo->prepare('UPDATE packages SET nation_id=:nation_id,title=:title,description=:description,price_php=:price_php,days=:days,nights=:nights,badge=:badge,is_featured=:is_featured,is_active=:is_active,sort_order=:sort_order WHERE id=:id')->execute($values);
                $packageId = $values['id'];
            } else {
                $pdo->prepare('INSERT INTO packages (nation_id,title,description,price_php,days,nights,badge,is_featured,is_active,sort_order) VALUES (:nation_id,:title,:description,:price_php,:days,:nights,:badge,:is_featured,:is_active,:sort_order)')->execute($values);
                $packageId = (int) $pdo->lastInsertId();
            }
            $pdo->prepare('DELETE FROM package_stops WHERE package_id = :id')->execute(['id' => $packageId]);
            $stopLines = preg_split('/\R/', (string) ($_POST['stops'] ?? '')) ?: [];
            $stopStmt = $pdo->prepare('INSERT INTO package_stops (package_id,name,sort_order) VALUES (:package_id,:name,:sort_order)');
            foreach ($stopLines as $index => $stopName) {
                $stopName = trim($stopName);
                if ($stopName !== '') {
                    $stopStmt->execute(['package_id' => $packageId, 'name' => $stopName, 'sort_order' => $index + 1]);
                }
            }
            $pdo->commit();
            set_flash('success', 'Package saved.');
        } elseif ($entity === 'locations') {
            $values = ['nation_id'=>(int)($_POST['nation_id']??0),'name'=>trim((string)($_POST['name']??'')),'image_path'=>trim((string)($_POST['image_path']??'')),'image_alt'=>trim((string)($_POST['image_alt']??'')),'description'=>trim((string)($_POST['description']??'')),'tag'=>trim((string)($_POST['tag']??'')),'sort_order'=>(int)($_POST['sort_order']??0)];
            if ($values['nation_id']<1 || $values['name']==='' || $values['image_path']==='') throw new InvalidArgumentException('Nation, name, and image path are required.');
            if ($operation==='edit') { $values['id']=(int)($_POST['id']??0); $pdo->prepare('UPDATE locations SET nation_id=:nation_id,name=:name,image_path=:image_path,image_alt=:image_alt,description=:description,tag=:tag,sort_order=:sort_order WHERE id=:id')->execute($values); } else { $pdo->prepare('INSERT INTO locations (nation_id,name,image_path,image_alt,description,tag,sort_order) VALUES (:nation_id,:name,:image_path,:image_alt,:description,:tag,:sort_order)')->execute($values); }
            set_flash('success','Location saved.');
        } elseif ($entity === 'tips') {
            $values = ['nation_id'=>(int)($_POST['nation_id']??0),'title'=>trim((string)($_POST['title']??'')),'body'=>trim((string)($_POST['body']??'')),'icon'=>trim((string)($_POST['icon']??'')),'sort_order'=>(int)($_POST['sort_order']??0)];
            if ($values['nation_id']<1 || $values['title']==='' || $values['body']==='') throw new InvalidArgumentException('Nation, title, and body are required.');
            if ($operation==='edit') { $values['id']=(int)($_POST['id']??0); $pdo->prepare('UPDATE tips SET nation_id=:nation_id,title=:title,body=:body,icon=:icon,sort_order=:sort_order WHERE id=:id')->execute($values); } else { $pdo->prepare('INSERT INTO tips (nation_id,title,body,icon,sort_order) VALUES (:nation_id,:title,:body,:icon,:sort_order)')->execute($values); }
            set_flash('success','Tip saved.');
        } elseif ($entity === 'faqs') {
            $values = ['question'=>trim((string)($_POST['question']??''),' '),'answer'=>trim((string)($_POST['answer']??'')),'sort_order'=>(int)($_POST['sort_order']??0),'is_published'=>isset($_POST['is_published'])?1:0];
            if ($values['question']==='' || $values['answer']==='') throw new InvalidArgumentException('Question and answer are required.');
            if ($operation==='edit') { $values['id']=(int)($_POST['id']??0); $pdo->prepare('UPDATE faqs SET question=:question,answer=:answer,sort_order=:sort_order,is_published=:is_published WHERE id=:id')->execute($values); } else { $pdo->prepare('INSERT INTO faqs (question,answer,sort_order,is_published) VALUES (:question,:answer,:sort_order,:is_published)')->execute($values); }
            set_flash('success','FAQ saved.');
        }
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Admin CRUD failed: ' . $e->getMessage());
        set_flash('error', 'Could not save the record. ' . ($e instanceof InvalidArgumentException ? e($e->getMessage()) : 'Please try again.'));
    }
    header('Location: crud.php?entity=' . rawurlencode($entity));
    exit;
}

$row = null;
if ($action === 'edit' && $id > 0) {
    $stmt = $pdo->prepare("SELECT * FROM {$entities[$entity]['table']} WHERE id = :id");
    $stmt->execute(['id'=>$id]);
    $row = $stmt->fetch();
    if (!is_array($row)) { http_response_code(404); exit('Record not found.'); }
}
if ($entity === 'packages' && is_array($row)) {
    $stopStmt = $pdo->prepare('SELECT name FROM package_stops WHERE package_id=:id ORDER BY sort_order,id');
    $stopStmt->execute(['id'=>$row['id']]);
    $row['stops'] = implode("\n", array_column($stopStmt->fetchAll(), 'name'));
}

$csrfToken = csrf_token();
if ($action === 'edit' || $action === 'add') {
    if ($entity === 'packages') $row = $row ?: ['nation_id'=>'','title'=>'','description'=>'','price_php'=>'','days'=>'','nights'=>'','badge'=>'','is_featured'=>0,'is_active'=>1,'sort_order'=>0,'stops'=>''];
    elseif ($entity === 'locations') $row = $row ?: ['nation_id'=>'','name'=>'','image_path'=>'','image_alt'=>'','description'=>'','tag'=>'','sort_order'=>0];
    elseif ($entity === 'tips') $row = $row ?: ['nation_id'=>'','title'=>'','body'=>'','icon'=>'','sort_order'=>0];
    elseif ($entity === 'faqs') $row = $row ?: ['question'=>'','answer'=>'','sort_order'=>0,'is_published'=>1];
    elseif ($entity === 'nations') $row = $row ?: ['slug'=>'','name'=>'','element'=>'','kicker'=>'','tagline'=>'','accent_color'=>'#82d7bd','sort_order'=>0,'image_path'=>'','hero_alt'=>'','card_alt'=>'','meta_description'=>'','about_kicker'=>'','about_heading'=>'','about_body'=>''];
}
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= e($label) ?> | Admin</title><link rel="stylesheet" href="admin.css"></head><body>
<header class="admin-header"><strong>Teyvat Travels Admin</strong><nav class="admin-nav"><a href="index.php">Dashboard</a><a href="crud.php?entity=nations">Nations</a><a href="crud.php?entity=packages">Packages</a><a href="crud.php?entity=locations">Locations</a><a href="crud.php?entity=tips">Tips</a><a href="crud.php?entity=faqs">FAQs</a><a href="inquiries.php">Inquiries</a><a href="profile.php">Director</a><a href="logout.php">Log out</a></nav></header>
<main class="admin-main">
  <div class="admin-title-row"><h1><?= e($label) ?></h1><?php if ($action === 'list'): ?><a class="button" href="crud.php?entity=<?= rawurlencode($entity) ?>&action=add">Add <?= e(rtrim($label,'s')) ?></a><?php endif; ?></div>
  <?php if ($flash): ?><p class="flash <?= $flash['type'] === 'error' ? 'error' : '' ?>"><?= e($flash['message']) ?></p><?php endif; ?>

<?php if ($action === 'add' || $action === 'edit'): ?>
  <form method="post" class="form-grid">
    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
    <input type="hidden" name="operation" value="<?= $action === 'edit' ? 'edit' : 'add' ?>">
    <?php if ($action === 'edit'): ?><input type="hidden" name="id" value="<?= (int) $row['id'] ?>"><?php endif; ?>
<?php if ($entity === 'nations'): ?>
    <div class="field"><label>Slug</label><input name="slug" required maxlength="40" value="<?= e($row['slug']) ?>"></div><div class="field"><label>Name</label><input name="name" required maxlength="60" value="<?= e($row['name']) ?>"></div>
    <div class="field"><label>Element</label><input name="element" maxlength="30" value="<?= e($row['element']) ?>"></div><div class="field"><label>Kicker</label><input name="kicker" maxlength="120" value="<?= e($row['kicker']) ?>"></div>
    <div class="field"><label>Tagline</label><input name="tagline" maxlength="255" value="<?= e($row['tagline']) ?>"></div><div class="field"><label>Accent color</label><input name="accent_color" required pattern="#[0-9A-Fa-f]{6}" value="<?= e($row['accent_color']) ?>"></div>
    <div class="field"><label>Sort order</label><input name="sort_order" type="number" min="0" value="<?= (int)$row['sort_order'] ?>"></div><div class="field"><label>Image path</label><input name="image_path" required maxlength="255" value="<?= e($row['image_path']) ?>"></div>
    <div class="field"><label>Hero alt</label><input name="hero_alt" maxlength="255" value="<?= e($row['hero_alt']) ?>"></div><div class="field"><label>Card alt</label><input name="card_alt" maxlength="255" value="<?= e($row['card_alt']) ?>"></div>
    <div class="field full"><label>Meta description</label><input name="meta_description" maxlength="300" value="<?= e($row['meta_description']) ?>"></div>
    <div class="field"><label>About kicker</label><input name="about_kicker" maxlength="120" value="<?= e($row['about_kicker']) ?>"></div><div class="field"><label>About heading</label><input name="about_heading" maxlength="200" value="<?= e($row['about_heading']) ?>"></div>
    <div class="field full"><label>About body</label><textarea name="about_body"><?= e($row['about_body']) ?></textarea></div>
<?php elseif ($entity === 'packages'): ?>
    <div class="field"><label>Nation</label><select name="nation_id" required><?php foreach($nations as $nation): ?><option value="<?= (int)$nation['id'] ?>" <?= (int)$row['nation_id']===(int)$nation['id']?'selected':'' ?>><?= e($nation['name']) ?></option><?php endforeach; ?></select></div>
    <div class="field"><label>Title</label><input name="title" required maxlength="160" value="<?= e($row['title']) ?>"></div><div class="field full"><label>Description</label><textarea name="description" required><?= e($row['description']) ?></textarea></div>
    <div class="field"><label>Price (PHP)</label><input name="price_php" type="number" min="0" required value="<?= (int)$row['price_php'] ?>"></div><div class="field"><label>Badge</label><input name="badge" maxlength="60" value="<?= e($row['badge']) ?>"></div>
    <div class="field"><label>Days</label><input name="days" type="number" min="1" required value="<?= (int)$row['days'] ?>"></div><div class="field"><label>Nights</label><input name="nights" type="number" min="0" required value="<?= (int)$row['nights'] ?>"></div>
    <div class="field"><label>Sort order</label><input name="sort_order" type="number" min="0" value="<?= (int)$row['sort_order'] ?>"></div>
    <div class="field"><label><input type="checkbox" name="is_featured" <?= $row['is_featured']?'checked':'' ?>> Featured</label><label><input type="checkbox" name="is_active" <?= $row['is_active']?'checked':'' ?>> Active</label></div>
    <div class="field full"><label>Package stops (one per line)</label><textarea name="stops"><?= e($row['stops']) ?></textarea></div>
<?php elseif ($entity === 'locations'): ?>
    <div class="field"><label>Nation</label><select name="nation_id" required><?php foreach($nations as $nation): ?><option value="<?= (int)$nation['id'] ?>" <?= (int)$row['nation_id']===(int)$nation['id']?'selected':'' ?>><?= e($nation['name']) ?></option><?php endforeach; ?></select></div><div class="field"><label>Name</label><input name="name" required maxlength="120" value="<?= e($row['name']) ?>"></div>
    <div class="field"><label>Image path</label><input name="image_path" required maxlength="255" value="<?= e($row['image_path']) ?>"></div><div class="field"><label>Image alt</label><input name="image_alt" maxlength="255" value="<?= e($row['image_alt']) ?>"></div>
    <div class="field full"><label>Description</label><textarea name="description"><?= e($row['description']) ?></textarea></div><div class="field"><label>Tag</label><input name="tag" maxlength="80" value="<?= e($row['tag']) ?>"></div><div class="field"><label>Sort order</label><input name="sort_order" type="number" min="0" value="<?= (int)$row['sort_order'] ?>"></div>
<?php elseif ($entity === 'tips'): ?>
    <div class="field"><label>Nation</label><select name="nation_id" required><?php foreach($nations as $nation): ?><option value="<?= (int)$nation['id'] ?>" <?= (int)$row['nation_id']===(int)$nation['id']?'selected':'' ?>><?= e($nation['name']) ?></option><?php endforeach; ?></select></div><div class="field"><label>Title</label><input name="title" required maxlength="120" value="<?= e($row['title']) ?>"></div>
    <div class="field full"><label>Body</label><textarea name="body" required><?= e($row['body']) ?></textarea></div><div class="field"><label>Icon key</label><input name="icon" maxlength="40" value="<?= e($row['icon']) ?>"></div><div class="field"><label>Sort order</label><input name="sort_order" type="number" min="0" value="<?= (int)$row['sort_order'] ?>"></div>
<?php elseif ($entity === 'faqs'): ?>
    <div class="field full"><label>Question</label><input name="question" required maxlength="255" value="<?= e($row['question']) ?>"></div><div class="field full"><label>Answer</label><textarea name="answer" required><?= e($row['answer']) ?></textarea></div>
    <div class="field"><label>Sort order</label><input name="sort_order" type="number" min="0" value="<?= (int)$row['sort_order'] ?>"></div><div class="field"><label><input type="checkbox" name="is_published" <?= $row['is_published']?'checked':'' ?>> Published</label></div>
<?php endif; ?>
    <div class="field full"><button class="button" type="submit">Save</button> <a class="button secondary" href="crud.php?entity=<?= rawurlencode($entity) ?>">Cancel</a></div>
  </form>
<?php else:
    $rows = $pdo->query("SELECT * FROM {$entities[$entity]['table']} ORDER BY " . ($entity === 'nations' ? 'sort_order,id' : ($entity === 'packages' ? 'sort_order,id' : 'id DESC')))->fetchAll();
?>
  <table><thead><tr><th>ID</th><th>Name / title</th><th>Details</th><th>Actions</th></tr></thead><tbody>
  <?php foreach ($rows as $record): ?>
    <?php $name = $record['name'] ?? $record['title'] ?? $record['question'] ?? ''; $details = $entity === 'nations' ? ($record['slug'] . ' / ' . $record['element']) : ($record['sort_order'] ?? ''); ?>
    <tr><td><?= (int)$record['id'] ?></td><td><?= e((string)$name) ?></td><td><?= e((string)$details) ?></td><td><div class="actions"><a class="button secondary" href="crud.php?entity=<?= rawurlencode($entity) ?>&action=edit&id=<?= (int)$record['id'] ?>">Edit</a><form method="post" onsubmit="return confirm('Delete this record?');"><input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>"><input type="hidden" name="operation" value="delete"><input type="hidden" name="id" value="<?= (int)$record['id'] ?>"><button class="button danger" type="submit">Delete</button></form></div></td></tr>
  <?php endforeach; ?>
  </tbody></table>
<?php endif; ?>
</main></body></html>
