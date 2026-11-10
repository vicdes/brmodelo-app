import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import WorkloadModal from "./WorkloadModal";

interface WorkloadModalOptions {
	cancelable?: boolean;
}

export function useWorkloadModal(
	initialValues: string[],
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    selectedValue: string[]
) {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useWorkloadModal must be used within a ModalsProvider");
	}
	return {
		open: (options: WorkloadModalOptions = {}) =>
			context.open<string[]>(({ onSuccess, onCancel, onError }) => (
				<WorkloadModal
					setIsOpen={setIsOpen}
					initialValues={initialValues}
					open
					cancelable={options.cancelable ?? true}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
                    selectedValue={selectedValue}
				/>
			)),
	};
}
