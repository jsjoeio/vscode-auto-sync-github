// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string) {
  const exec = require("child_process").exec
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      (
        error: { name: string; message: string },
        stdout: string,
        stderr: string
      ) => {
        if (error) {
          console.warn(error)
        }
        resolve(stdout ? stdout : stderr)
      }
    )
  })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "auto-sync-github" is now active!'
  )

  // TODO add check to make sure it's a git repository (otherwise fatal error)
  console.log(vscode.workspace.workspaceFolders, " folders")
  const currentFolderPath = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.path
    : "missing"

  const isGitDirectory = await doesGitDirectoryExist(currentFolderPath)

  if (isGitDirectory) {
    // I think this could be the issue, I should probably write my own function
    // and pass in the path
    const stdout = await execShellCommand("git pull")
    console.log(stdout, "this is the message")
  }

  vscode.window.showInformationMessage("VS Code has recently started!")
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "auto-sync-github.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed

      vscode.window.showInformationMessage("this is inside the command")
      // Display a message box to the user
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export async function deactivate(): Promise<void> {
  console.log("Your extension is shutting down.")
  // const terminal = vscode.window.createTerminal();
  // push everything to git
  // terminal.sendText(`git add . && git commit -m "add notes" && git push`, true);
  await execShellCommand(
    'git add . && git commit -m "notes added (auto-sync-github)"'
  )
  await execShellCommand("git push")

  return undefined
}

function doesGitDirectoryExist(dir: string): Promise<boolean> {
  return new Promise((resolve) => {
    const itExists = fs.existsSync(path.join(dir, ".git"))
    console.log("it is a git directory", itExists)

    if (!itExists) {
      console.log(`this is the directory: ${dir}`)
    }
    resolve(itExists)
  })
}
