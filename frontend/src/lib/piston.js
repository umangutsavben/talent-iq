// Wandbox API for code execution (replaces Piston which is no longer public)

const WANDBOX_API = "https://wandbox.org/api/compile.json";

const LANGUAGE_CONFIG = {
  javascript: { compiler: "nodejs-20.17.0", extension: "js" },
  python: { compiler: "cpython-3.12.7", extension: "py" },
  java: { compiler: "openjdk-jdk-22+36", extension: "java" },
};

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const config = LANGUAGE_CONFIG[language];

    if (!config) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetch(WANDBOX_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler: config.compiler,
        code: code,
        save: false,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    const output = data.program_output || "";
    const stderr = data.program_error || "";
    const compileError = data.compiler_error || "";

    if (compileError) {
      return {
        success: false,
        output: output,
        error: compileError,
      };
    }

    if (stderr) {
      return {
        success: false,
        output: output,
        error: stderr,
      };
    }

    return {
      success: true,
      output: output || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}

