
import json
from pathlib import Path

IGNORE = set([
    'location-x',
    'location-y',
    'location-grid',
    'location-accuracy',
    
])


def main():
    taxonomy = json.load(Path(__file__).with_name('column_types.json').open('r'))
    processed = []
    for item in taxonomy:
        name = item['name']
        if name.startswith('meta:'):
            continue
        name = name.replace(':', '-')
        if name in IGNORE:
            continue
        processed.append(dict(
            name=name,
            type=item['dataType'],
            description=item.get('description') or None,
            title=item['title']
        ))
    out = json.dumps(processed, indent=2, sort_keys=True, ensure_ascii=False)
    out = 'export const taxonomy = ' + out + ';\n'
    outfile = Path(__file__).parent.parent / 'projects' / 'treebase' / 'src' / 'app' / 'taxonomy.ts'
    outfile.open('w').write(out)

if __name__ == '__main__':
    main()