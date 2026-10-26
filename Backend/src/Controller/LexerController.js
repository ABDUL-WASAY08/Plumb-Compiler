const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');


const compilerDir = path.resolve(__dirname, '../../../Compiler');
const classesDir = path.join(compilerDir, 'build', 'classes', 'java', 'main');
const libsDir = path.join(compilerDir, 'build', 'libs');

function resolveClasspath() {
    if (fs.existsSync(classesDir)) {
        return classesDir;
    }

    if (fs.existsSync(libsDir)) {
        const jar = fs.readdirSync(libsDir).find((file) => file.endsWith('.jar'));
        if (jar) {
            return path.join(libsDir, jar);
        }
    }

    return null;
}

exports.tokenizeCode = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const classpath = resolveClasspath();
    if (!classpath) {
        return res.status(500).json({
            error: `Lexer classes not found. Run "gradle build" in ${compilerDir}. Looked for ${classesDir}`,
        });
    }

    execFile('java', ['-cp', classpath, 'LexerRunner', code], (error, stdout, stderr) => {
        if (error) {
            console.error('Java execution error:', stderr);
            return res.status(500).json({ error: stderr || 'Lexer execution failed' });
        }

        try {
            const tokens = JSON.parse(stdout.trim());
            return res.status(200).json({ tokens });
        } catch (parseError) {
            console.error('JSON parse error:', stdout);
            return res.status(500).json({ error: 'Invalid output format from lexer' });
        }
    });
};
