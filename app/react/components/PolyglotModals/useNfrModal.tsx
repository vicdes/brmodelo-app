import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import WorkloadModal from "./WorkloadModal";
import NfrModal from "./NfrModal";

interface WorkloadModalOptions {
	cancelable?: boolean;
}

export function useNfrModal(
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    selectedValue?: string[]
) {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useWorkloadModal must be used within a ModalsProvider");
	}
	return {
		open: (options: WorkloadModalOptions = {}) =>
			context.open<string[]>(({ onSuccess, onCancel, onError }) => (
				<NfrModal
					setIsOpen={setIsOpen}
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
