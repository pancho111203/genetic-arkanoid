import json
import os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def load_metrics(file):
    with open(os.path.join(os.path.dirname(__file__), '../dist/results/', file), 'r') as f:
        metrics = json.load(f)

    return (metrics['settings'], metrics['generations'])


def add_plot(ax, generations, alg_type, label, color=None):
    if alg_type == 'annealing':
        xdata = [gen[0]['iteration'] for gen in generations]
        ydata = [-gen[0]['fitness'] for gen in generations]
    else:
        xdata = []
        ydata = []
        simulations = 0
        best = 999999999
        for gen in generations:
            simulations += len(gen)
            xdata.append(simulations)

            if gen[0]['fitness'] < best:
                best = gen[0]['fitness']

            ydata.append(best)

    if color is None:
        return ax.plot(xdata, ydata, label=label)
    else:
        return ax.plot(xdata, ydata, color=color, label=label)


def plot_metrics(metricFileNames, property=None, plotNames=None, colors=None, title=''):
    fig = plt.figure()
    ax = fig.add_subplot(1, 1, 1)
    lines = []
    for idx, metricFileName in enumerate(metricFileNames):
        (settings, generations) = load_metrics(metricFileName)
        alg_type = metricFileName.split('_')[0]
        if property is not None:
            name = settings[property]
        elif plotNames is not None:
            name = plotNames[idx]

        if colors is None:
            line = add_plot(ax, generations, alg_type, name)
        else:
            line = add_plot(ax, generations, alg_type, name, color=colors[idx])
        
        lines.append(line)

    # red_patch = mpatches.Patch(color='red', label='Enfriamiento Simulado')
    # blue_patch = mpatches.Patch(color='blue', label='Genetico')

    # plt.legend(handles=[red_patch, blue_patch])
    if plotNames is not None:
        ax.legend(plotNames)
    else:
        ax.legend()

    ax.set_xlabel('Simulaciones ejecutadas')
    ax.set_ylabel('Fitness')
    ax.set_title(title)
    plt.show()


if __name__ == '__main__':
    plot_metrics(['genetic_lvl20_3324.json'], property='size', title='Loles')

#plot_metrics([], plotNames=[], colors=[], title='')
#plot_metrics(['genetic_lvl20_4080.json', 'genetic_lvl20_4459.json', 'genetic_lvl20_3390.json', 'genetic_lvl20_3840.json', 'genetic_lvl20_3324.json', 'genetic_lvl20_3840_2.json', 'genetic_lvl20_5210.json', 'genetic_lvl20_3834.json', 'genetic_lvl20_4140.json'], plotNames=['Random childs 1', 'Random childs 2', 'Random childs 3', 'Normal 1', 'Normal 2', 'Normal 3', 'keepBest=false 1', 'keepBest=false 2', 'keepBest=false 3'], colors=['red', 'red', 'red', 'green', 'green', 'green','blue', 'blue', 'blue'], title='Comparacion algoritmo genetico')
#plot_metrics(['annealing_lvl20_2664.json', 'annealing_lvl20_3270.json', 'annealing_lvl20_3141_s1.json', 'annealing_lvl20_3500_s1.json'], plotNames=['Normal 1', 'Normal 2', 'Sucesor V2 1', 'Sucesor V2 2'], colors=['red', 'red', 'green', 'green'], title='Comparacion enfriamiento simulado')
#plot_metrics(['genetic_lvl20_4080.json', 'genetic_lvl20_4459.json', 'genetic_lvl20_3390.json', 'genetic_lvl20_3840.json', 'genetic_lvl20_3324.json', 'genetic_lvl20_3840_2.json', 'genetic_lvl20_5210.json', 'genetic_lvl20_3834.json', 'genetic_lvl20_4140.json', 'annealing_lvl20_2664.json', 'annealing_lvl20_3270.json', 'annealing_lvl20_3141_s1.json', 'annealing_lvl20_3500_s1.json'], plotNames=['Genetico', 'Genetico', 'Genetico', 'Genetico', 'Genetico', 'Genetico', 'Genetico', 'Genetico', 'Genetico', 'Enfriamiento Simulado', 'Enfriamiento Simulado', 'Enfriamiento Simulado', 'Enfriamiento Simulado'], colors=['blue', 'blue', 'blue', 'blue', 'blue', 'blue','blue', 'blue', 'blue', 'red', 'red', 'red', 'red'], title='Comparacion ambos algoritmos')