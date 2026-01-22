import format from 'format-message';
import {eureka} from '../ctx';

/**
 * Inject Eureka toolbox into the workspace
 * @param list the target toolbox's list
 * @param workspace The workspace, usuaully `Blockly.getMainWorkspace()`
 * @returns The modified xml list
 */
export function injectToolbox (
    list: HTMLElement[] | Record<string, unknown>[],
    workspace: DucktypedBlocksWorkspace, useJSON = false
) {
    if (useJSON) {
        const jsonList = list as Record<string, unknown>[];
        jsonList.push({
            kind: 'sep',
            gap: 36
        });
        jsonList.push({
            kind: 'label',
            text: '💡 Eureka'
        });
        jsonList.push({
            kind: 'button',
            text: format({
                id: 'eureka.openDashboard',
                default: 'Open Dashboard'
            }),
            callbackKey: 'EUREKA_FRONTEND'
        });
        workspace.registerButtonCallback('EUREKA_FRONTEND', () => {
            eureka.openDashboard();
        });
        return jsonList;
    }
    const xmlList = list as HTMLElement[];
    // Add separator and label
    const sep = document.createElement('sep');
    sep.setAttribute('gap', '36');
    xmlList.push(sep);
    const label = document.createElement('label');
    label.setAttribute('text', '💡 Eureka');
    xmlList.push(label);

    // Add dashboard button
    const dashboardButton = document.createElement('button');
    dashboardButton.setAttribute('text', format({
        id: 'eureka.openDashboard',
        default: 'Open Dashboard'
    }));
    dashboardButton.setAttribute('callbackKey', 'EUREKA_FRONTEND');
    workspace.registerButtonCallback('EUREKA_FRONTEND', () => {
        eureka.openDashboard();
    });
    xmlList.push(dashboardButton);

    // Add eureka detection block
    const mutation = document.createElement('mutation');
    mutation.setAttribute('eureka', 'installed');
    const field = document.createElement('field');
    field.setAttribute('name', 'VALUE');
    field.innerHTML = '🧐 Eureka?';
    const block = document.createElement('block');
    block.setAttribute('type', 'argument_reporter_boolean');
    block.setAttribute('gap', '16');
    block.appendChild(field);
    block.appendChild(mutation);
    xmlList.push(block);
    return xmlList;
}
