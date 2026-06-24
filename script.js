/**
 * Calculadora Interactiva de la Ley de Enfriamiento de Newton
 * Ecuación: T(t) = Ta + (T0 - Ta) * e^(k * t)
 * Storytelling del "Pollo Térmico"
 */

// Variables globales
let coolingChart = null;
let currentSimulationState = {
    T0: null,
    Ta: null,
    k: null,
    maxTime: 60
};

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    setupEventListeners();
});

/**
 * Muestra un mensaje en pantalla estilo Toast (Notificación elegante)
 * @param {string} title - Título del mensaje
 * @param {string} message - Descripción del mensaje
 * @param {string} type - Tipo de mensaje ('success' o 'error')
 */
function showNotification(title, message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
    
    const iconClass = type === 'error' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';

    toast.innerHTML = `
        <i class="${iconClass} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto-eliminar después de 6 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 6000);
}

/**
 * Valida la coherencia termodinámica de las temperaturas
 * @param {number} T0 - Temperatura inicial
 * @param {number} Ta - Temperatura ambiente
 * @param {number} Tx - Temperatura medida/objetivo a evaluar (opcional)
 * @param {string} labelTx - Nombre del campo Tx para mostrar en errores (opcional)
 * @returns {boolean} - true si es válido, false en caso contrario
 */
function validateThermodynamics(T0, Ta, Tx = null, labelTx = 'Temperatura') {
    if (isNaN(T0) || isNaN(Ta)) {
        showNotification('Datos incompletos', 'Por favor ingresa valores numéricos válidos.');
        return false;
    }

    // Caso 1: T0 es igual a Ta (No hay transferencia de calor)
    if (Math.abs(T0 - Ta) < 1e-5) {
        showNotification(
            'Equilibrio Térmico Inicial',
            'La temperatura inicial (T₀) es igual a la ambiental (Tₐ). En estas condiciones no hay intercambio de calor natural ni cambio de temperatura del pollo.'
        );
        return false;
    }

    if (Tx !== null) {
        // Enfriamiento (T0 > Ta)
        if (T0 > Ta) {
            if (Tx >= T0) {
                showNotification(
                    'Inconsistencia Física',
                    `En un proceso de enfriamiento (T₀ > Tₐ), la ${labelTx} (${Tx}°C) no puede ser mayor o igual que la inicial (T₀ = ${T0}°C) sin una fuente externa de calor.`
                );
                return false;
            }
            if (Tx <= Ta) {
                showNotification(
                    'Violación Termodinámica',
                    `Un pollo que se enfría de forma natural en un medio a ${Ta}°C no puede alcanzar ni descender por debajo de la temperatura ambiente (Tₐ = ${Ta}°C) sin un sistema de refrigeración activo.`
                );
                return false;
            }
        }
        // Calentamiento (T0 < Ta)
        else {
            if (Tx <= T0) {
                showNotification(
                    'Inconsistencia Física',
                    `En un proceso de calentamiento (T₀ < Tₐ), la ${labelTx} (${Tx}°C) no puede ser menor o igual que la inicial (T₀ = ${T0}°C) sin un sistema de enfriamiento externo.`
                );
                return false;
            }
            if (Tx >= Ta) {
                showNotification(
                    'Violación Termodinámica',
                    `Un pollo que se calienta de forma natural en un medio a ${Ta}°C no puede alcanzar ni superar la temperatura ambiente (Tₐ = ${Ta}°C) sin una fuente de calor interna o externa adicional.`
                );
                return false;
            }
        }
    }

    return true;
}

/**
 * Inicializa la gráfica con Chart.js con estilos oscuros y limpios
 */
function initChart() {
    const ctx = document.getElementById('coolingChart').getContext('2d');
    
    coolingChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Curva de Temperatura del Pollo',
                    data: [],
                    borderColor: '#ff6b4a',
                    borderWidth: 3,
                    backgroundColor: 'rgba(255, 107, 74, 0.05)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0
                },
                {
                    label: 'Temperatura Ambiente (Medio)',
                    data: [],
                    borderColor: '#00d2ff',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Puntos en el tiempo',
                    data: [],
                    backgroundColor: '#a855f7',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { family: 'Outfit', size: 13 },
                    bodyFont: { family: 'Inter', size: 12 },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)} °C a los ${context.parsed.x.toFixed(2)} min`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Tiempo (minutos)',
                        color: '#9ca3af',
                        font: { family: 'Inter', size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura (°C)',
                        color: '#9ca3af',
                        font: { family: 'Inter', size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el estado visual y la narrativa del Pollo Térmico
 * @param {number} T - Temperatura actual del pollo
 * @param {number} T0 - Temperatura inicial del pollo
 * @param {number} Ta - Temperatura ambiente del pollo
 */
function updateChickenState(T, T0, Ta) {
    const tempBadge = document.getElementById('chicken-temp-badge');
    const chickenStory = document.getElementById('chicken-story');
    const steamContainer = document.getElementById('steam-container');
    const frostContainer = document.getElementById('frost-container');
    const glowEl = document.getElementById('chicken-glow');
    const storyIcon = document.getElementById('story-icon-box');

    if (!tempBadge || !chickenStory || !steamContainer || !frostContainer || !glowEl || !storyIcon) return;

    tempBadge.textContent = `${T.toFixed(1)} °C`;

    // 1. Estados según rango de Temperatura del pollo
    if (T >= 75) {
        // MUY CALIENTE
        tempBadge.style.color = '#ff6b4a';
        tempBadge.style.borderColor = 'rgba(255, 107, 74, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(255, 107, 74, 0.7) 0%, transparent 70%)';
        
        steamContainer.classList.remove('hidden');
        frostContainer.classList.add('hidden');
        
        // Ajustar intensidad de vapor
        Array.from(steamContainer.children).forEach(s => {
            s.style.display = 'block';
            s.style.opacity = '0.9';
        });

        storyIcon.innerHTML = '<i class="fa-solid fa-fire" style="color: #ff6b4a;"></i>';
        chickenStory.innerHTML = `<strong>¡Recién horneado y ardiendo!</strong> El pollo está a <strong>${T.toFixed(1)} °C</strong>. Emite una columna densa de vapor caliente. A esta temperatura, toda bacteria es eliminada, ¡pero cuidado con quemarte!`;
    } 
    else if (T >= 50) {
        // CALIENTE / LISTO PARA SERVIR
        tempBadge.style.color = '#f59e0b';
        tempBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.6) 0%, transparent 70%)';
        
        steamContainer.classList.remove('hidden');
        frostContainer.classList.add('hidden');
        
        // Vapor moderado
        Array.from(steamContainer.children).forEach((s, idx) => {
            if (idx === 2) s.style.display = 'none'; // ocultar una línea de vapor
            s.style.opacity = '0.4';
        });

        storyIcon.innerHTML = '<i class="fa-solid fa-drumstick-bite" style="color: #f59e0b;"></i>';
        chickenStory.innerHTML = `<strong>Listo para consumir:</strong> La temperatura es ideal (<strong>${T.toFixed(1)} °C</strong>). El pollo está caliente, jugoso y desprendiendo un delicioso aroma en forma de vapor ligero. ¡Buen provecho!`;
    } 
    else if (T >= 30) {
        // TIBIO / ZONA DE RIESGO
        tempBadge.style.color = '#a855f7';
        tempBadge.style.borderColor = 'rgba(168, 85, 247, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)';
        
        steamContainer.classList.add('hidden');
        frostContainer.classList.add('hidden');

        storyIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #a855f7;"></i>';
        chickenStory.innerHTML = `<strong>Zona de peligro bacteriano:</strong> A <strong>${T.toFixed(1)} °C</strong>, las bacterias patógenas pueden reproducirse rápidamente si se deja al aire por más de 2 horas. Es necesario consumirlo pronto o refrigerarlo.`;
    } 
    else if (T >= 18) {
        // EN EQUILIBRIO AMBIENTAL
        tempBadge.style.color = '#9ca3af';
        tempBadge.style.borderColor = 'rgba(156, 163, 175, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(156, 163, 175, 0.3) 0%, transparent 70%)';
        
        steamContainer.classList.add('hidden');
        frostContainer.classList.add('hidden');

        storyIcon.innerHTML = '<i class="fa-solid fa-wind" style="color: #9ca3af;"></i>';
        chickenStory.innerHTML = `<strong>Temperatura ambiente:</strong> El pollo se ha estabilizado a <strong>${T.toFixed(1)} °C</strong> en equilibrio térmico con el entorno. Se recomienda refrigeración inmediata para conservarlo de forma segura.`;
    } 
    else if (T >= 4) {
        // REFRIGERACIÓN
        tempBadge.style.color = '#00d2ff';
        tempBadge.style.borderColor = 'rgba(0, 210, 255, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(0, 210, 255, 0.5) 0%, transparent 70%)';
        
        steamContainer.classList.add('hidden');
        frostContainer.classList.remove('hidden');

        storyIcon.innerHTML = '<i class="fa-regular fa-snowflake" style="color: #00d2ff;"></i>';
        chickenStory.innerHTML = `<strong>Refrigerado seguro:</strong> El pollo está a <strong>${T.toFixed(1)} °C</strong>. Las bacterias están en estado letárgico, lo que permite conservarlo fresco durante 3 a 4 días.`;
    } 
    else {
        // CONGELACIÓN
        tempBadge.style.color = '#3b82f6';
        tempBadge.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        glowEl.style.background = 'radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, transparent 70%)';
        
        steamContainer.classList.add('hidden');
        frostContainer.classList.remove('hidden');

        storyIcon.innerHTML = '<i class="fa-solid fa-icicles" style="color: #3b82f6;"></i>';
        chickenStory.innerHTML = `<strong>¡Congelado!</strong> A <strong>${T.toFixed(1)} °C</strong>, el pollo se congela. El agua se convierte en microcristales, deteniendo cualquier actividad orgánica para su preservación prolongada.`;
    }
}

/**
 * Dibuja la curva matemática de Newton e inserta los puntos clave
 * @param {number} T0 - Temperatura inicial
 * @param {number} Ta - Temperatura ambiente
 * @param {number} k - Constante de enfriamiento
 * @param {Array<{x: number, y: number, label: string}>} customPoints - Puntos a marcar
 */
function updateChart(T0, Ta, k, customPoints = []) {
    if (!coolingChart) return;

    // Calcular el tiempo máximo razonable (99.9% del cambio)
    let maxTime = 60;
    if (k !== 0) {
        maxTime = Math.abs(Math.log(0.001) / k);
        if (maxTime < 10) maxTime = 10;
        if (maxTime > 1440) maxTime = 1440; // Max 24 horas
    }

    // Guardar maxTime en el estado
    currentSimulationState.maxTime = maxTime;

    // Generar datos de curva
    const curvePoints = [];
    const step = maxTime / 100;
    for (let t = 0; t <= maxTime * 1.1; t += step) {
        const T = Ta + (T0 - Ta) * Math.exp(k * t);
        curvePoints.push({ x: t, y: T });
    }

    // Línea ambiente
    const ambientLine = [
        { x: 0, y: Ta },
        { x: maxTime * 1.1, y: Ta }
    ];

    // Puntos clave a graficar
    const keyPoints = [
        { x: 0, y: T0 }
    ];

    customPoints.forEach(p => {
        if (!keyPoints.some(kp => Math.abs(kp.x - p.x) < 1e-4)) {
            keyPoints.push(p);
        }
    });

    // Actualizar datasets
    coolingChart.data.datasets[0].data = curvePoints;
    coolingChart.data.datasets[1].data = ambientLine;
    coolingChart.data.datasets[2].data = keyPoints;

    // Ajustar colores
    if (T0 > Ta) {
        coolingChart.data.datasets[0].borderColor = '#ff6b4a';
        coolingChart.data.datasets[0].backgroundColor = 'rgba(255, 107, 74, 0.05)';
    } else {
        coolingChart.data.datasets[0].borderColor = '#a855f7';
        coolingChart.data.datasets[0].backgroundColor = 'rgba(168, 85, 247, 0.05)';
    }

    coolingChart.update();
    
    // Texto del estado de la gráfica
    const statusLabel = document.getElementById('chart-status-label');
    if (statusLabel) {
        statusLabel.textContent = `Graficando: T₀ = ${T0.toFixed(1)}°C, Tₐ = ${Ta.toFixed(1)}°C, k = ${k.toFixed(6)}`;
    }
}

/**
 * Propaga los valores de entrada de Temperatura Inicial y Ambiente
 * @param {string} sourceId - ID del campo origen ('1', '2' o '3')
 */
function syncCommonInputs(sourceId) {
    const T0 = document.getElementById(`T0_${sourceId}`).value;
    const Ta = document.getElementById(`Ta_${sourceId}`).value;

    ['1', '2', '3'].forEach(id => {
        if (id !== sourceId) {
            const T0_field = document.getElementById(`T0_${id}`);
            const Ta_field = document.getElementById(`Ta_${id}`);
            if (T0_field && T0 !== '') T0_field.value = T0;
            if (Ta_field && Ta !== '') Ta_field.value = Ta;
        }
    });
}

/**
 * Configura los event listeners y el controlador del slider
 */
function setupEventListeners() {
    // Sincronizar T0 y Ta en los campos
    ['1', '2', '3'].forEach(id => {
        document.getElementById(`T0_${id}`).addEventListener('input', () => syncCommonInputs(id));
        document.getElementById(`Ta_${id}`).addEventListener('input', () => syncCommonInputs(id));
    });

    const timelineInput = document.getElementById('chicken-timeline');
    const timelineVal = document.getElementById('timeline-time-val');

    // Manejar el movimiento del slider (línea de tiempo interactiva)
    timelineInput.addEventListener('input', (e) => {
        const t = parseFloat(e.target.value);
        timelineVal.textContent = `${t.toFixed(1)} min`;

        const { T0, Ta, k } = currentSimulationState;
        if (T0 !== null && Ta !== null && k !== null) {
            // Calcular temperatura en ese instante
            const T = Ta + (T0 - Ta) * Math.exp(k * t);
            
            // Actualizar pollo
            updateChickenState(T, T0, Ta);

            // Actualizar punto flotante en el gráfico
            updateChart(T0, Ta, k, [{ x: t, y: T }]);
            document.getElementById('legend-current').classList.remove('hidden');
        }
    });

    // Activar los parámetros actuales de simulación y el control timeline
    const activateTimeline = (T0, Ta, k, activeT, activeTemp) => {
        currentSimulationState.T0 = T0;
        currentSimulationState.Ta = Ta;
        currentSimulationState.k = k;

        // Calcular maxTime para adaptar la barra
        let maxTime = Math.abs(Math.log(0.001) / k);
        if (maxTime < 10) maxTime = 10;
        if (maxTime > 1440) maxTime = 1440;
        currentSimulationState.maxTime = maxTime;

        timelineInput.disabled = false;
        timelineInput.max = maxTime.toFixed(1);
        timelineInput.value = activeT;
        timelineVal.textContent = `${activeT.toFixed(1)} min`;

        // Actualizar el pollo
        updateChickenState(activeTemp, T0, Ta);
    };

    // PASO 1: Calcular la constante 'k'
    document.getElementById('btn-k').addEventListener('click', () => {
        const T0 = parseFloat(document.getElementById('T0_1').value);
        const Ta = parseFloat(document.getElementById('Ta_1').value);
        const Tt = parseFloat(document.getElementById('Tt_1').value);
        const t = parseFloat(document.getElementById('t_1').value);

        if (!validateThermodynamics(T0, Ta, Tt, 'temperatura medida')) return;

        if (isNaN(t) || t <= 0) {
            showNotification('Tiempo inválido', 'El tiempo transcurrido de referencia debe ser mayor a 0.');
            return;
        }

        // Fórmula: k = ln((T(t) - Ta) / (T0 - Ta)) / t
        try {
            const ratio = (Tt - Ta) / (T0 - Ta);
            const k = Math.log(ratio) / t;

            // Mostrar resultado
            document.getElementById('out-k').textContent = k.toFixed(6);
            document.getElementById('result-k-container').classList.remove('hidden');

            // Auto-llenar k
            document.getElementById('k_2').value = k.toFixed(6);
            document.getElementById('k_3').value = k.toFixed(6);

            showNotification('Cálculo Exitoso', 'La constante k ha sido calculada y vinculada a los pasos siguientes.', 'success');

            // Actualizar gráfica y simulación
            updateChart(T0, Ta, k, [{ x: t, y: Tt }]);
            activateTimeline(T0, Ta, k, t, Tt);
        } catch (error) {
            showNotification('Error Matemático', 'Hubo un error al calcular los logaritmos. Verifica los valores térmicos.');
        }
    });

    // PASO 2: Predecir Temperatura en tiempo t
    document.getElementById('btn-temp').addEventListener('click', () => {
        const T0 = parseFloat(document.getElementById('T0_2').value);
        const Ta = parseFloat(document.getElementById('Ta_2').value);
        const k = parseFloat(document.getElementById('k_2').value);
        const t = parseFloat(document.getElementById('t_2').value);

        if (!validateThermodynamics(T0, Ta)) return;

        if (isNaN(k)) {
            showNotification('Falta Constante k', 'Por favor, ingresa la constante k o calcúlala en el Paso 1.');
            return;
        }
        
        if (isNaN(t) || t < 0) {
            showNotification('Tiempo inválido', 'El tiempo de consulta no puede ser negativo.');
            return;
        }

        if (k > 0) {
            showNotification(
                'Constante k Positiva',
                'Una constante k positiva causará un incremento térmico exponencial indefinido (calentamiento artificial explosivo).',
                'error'
            );
        }

        // Fórmula: T(t) = Ta + (T0 - Ta) * e^(k * t)
        const T_t = Ta + (T0 - Ta) * Math.exp(k * t);

        document.getElementById('out-temp').textContent = T_t.toFixed(2);
        document.getElementById('result-temp-container').classList.remove('hidden');

        // Mostrar en gráfica y activar timeline
        updateChart(T0, Ta, k, [{ x: t, y: T_t }]);
        activateTimeline(T0, Ta, k, t, T_t);
        document.getElementById('legend-current').classList.remove('hidden');
    });

    // PASO 3: Calcular Tiempo requerido para T_objetivo
    document.getElementById('btn-time').addEventListener('click', () => {
        const T0 = parseFloat(document.getElementById('T0_3').value);
        const Ta = parseFloat(document.getElementById('Ta_3').value);
        const k = parseFloat(document.getElementById('k_3').value);
        const Tobj = parseFloat(document.getElementById('Tobj_3').value);

        if (!validateThermodynamics(T0, Ta, Tobj, 'temperatura objetivo')) return;

        if (isNaN(k) || k === 0) {
            showNotification('Falta Constante k', 'Por favor, ingresa una constante k válida diferente de cero.');
            return;
        }

        // Fórmula: t = ln((Tobj - Ta) / (T0 - Ta)) / k
        try {
            const ratio = (Tobj - Ta) / (T0 - Ta);
            
            if (ratio <= 0) {
                showNotification('Error de Cálculo', 'La temperatura objetivo no está en el rango térmico natural.');
                return;
            }

            const t = Math.log(ratio) / k;

            document.getElementById('out-time').textContent = t.toFixed(2);
            document.getElementById('result-time-container').classList.remove('hidden');

            // Mostrar en gráfica y activar timeline
            updateChart(T0, Ta, k, [{ x: t, y: Tobj }]);
            activateTimeline(T0, Ta, k, t, Tobj);
            document.getElementById('legend-current').classList.remove('hidden');
        } catch (error) {
            showNotification('Error Matemático', 'El logaritmo no puede resolverse. Verifica el signo de la constante k o las temperaturas.');
        }
    });
}
