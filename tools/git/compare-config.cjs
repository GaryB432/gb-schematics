const { exec } = require('child_process');
const { promises: fs } = require('fs');
const path = require('path');

const wslConfigFile = path.join('/tmp', 'wsl_git_config.txt');
const winConfigFile = path.join('/tmp', 'win_git_config.txt');

async function compareGitConfigs() {
  try {
    // Execute git config --list for WSL
    console.log('Retrieving WSL2 Git configuration...');
    const { stdout: wslConfig } = await execCommand('git config --list --show-origin');
    await fs.writeFile(wslConfigFile, wslConfig);

    // Execute git config --list for Windows (using git.exe)
    console.log('Retrieving Windows Git configuration...');
    const { stdout: winConfig } = await execCommand('git.exe config --list --show-origin');
    await fs.writeFile(winConfigFile, winConfig);

    // Compare the two outputs with the diff command
    console.log('\n--- Differences between WSL2 and Windows Git configs ---');
    await execCommand(`diff -u ${wslConfigFile} ${winConfigFile}`, {
      showOutput: true,
      ignoreDiffExit: true,
    });
  } catch (err) {
    console.error('An unexpected error occurred:', err);
  } finally {
    // Cleanup temporary files
    console.log('\nCleaning up temporary files...');
    await fs.rm(wslConfigFile, { force: true });
    await fs.rm(winConfigFile, { force: true });
  }
}

function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      // Allow diff to exit with code 1 if differences are found
      if (options.ignoreDiffExit && error && error.code === 1) {
        if (options.showOutput) {
          console.log(stdout);
          console.error(stderr);
        }
        return resolve({ stdout, stderr });
      }

      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(stderr);
        return reject(error);
      }

      if (options.showOutput) {
        console.log(stdout);
      }

      resolve({ stdout, stderr });
    });
  });
}

compareGitConfigs();
