#!/usr/bin/env python3
import os

EXCLUDE_DIRS = {'.next', '.vscode', 'node_modules', '.git', '.husky', 'public', 'assets'}
EXCLUDE_FILES = {'README.md', 'LICENSE.md', 'package-lock.json', 'all_frontend_files.txt', 'all_front_files.py', 'collect_structure.py', 'structure_new.txt', 'pnpm-lock.yaml', '.gitignore', '.env.example', '.env'}
OUTPUT_FILE   = 'all_frontend_files.txt'

def main() -> None:
    collected_files: list[str] = []

    # topdown=True позволяет «обрезать» dirs на лету
    for root, dirs, files in os.walk('.', topdown=True):
        # Удаляем каталоги, которые не нужно обходить
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for filename in files:
            if filename in EXCLUDE_FILES:
                continue
            collected_files.append(os.path.join(root, filename))

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        for i, file_path in enumerate(collected_files, start=1):
            out.write(f'{i}) {file_path}\n')
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    out.write(f.read())
            except UnicodeDecodeError:
                out.write('[Файл не декодируется в UTF-8]\n')
            out.write('\n\n')   # визуальный разделитель между файлами

    print(f'Сформирован файл: {OUTPUT_FILE}')

if __name__ == '__main__':
    main()
